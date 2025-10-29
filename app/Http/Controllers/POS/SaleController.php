<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{Product, ProductVariant, Sale, SaleItem, SalePayment, Customer};
use Barryvdh\DomPDF\Facade\Pdf;

class SaleController extends Controller
{
    public function searchProducts(Request $request)
    {
        $query = trim((string) $request->input('q'));
        if ($query === '') {
            return response()->json([]);
        }

        $products = Product::query()
            ->with(['variants.color'])
            ->when(is_numeric($query), function ($q) use ($query) {
                $q->where('id', (int) $query)
                  ->orWhere('price', $query);
            })
            ->orWhere('barcode', 'like', "%{$query}%")
            ->orWhere('name', 'like', "%{$query}%")
            ->orWhere('slug', 'like', "%{$query}%")
            ->limit(20)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'variants' => $product->variants->map(function ($v) {
                        return [
                            'id' => $v->id,
                            'sku' => $v->sku,
                            'price' => (float) $v->price,
                            'stock' => (int) $v->stock_quantity,
                            'color' => $v->color ? $v->color->name : null,
                        ];
                    }),
                ];
            });

        // Also search by variant SKU for barcode/sku scanning
        $variantMatches = ProductVariant::with(['product', 'color'])
            ->where(function ($q) use ($query) {
                $q->where('sku', 'like', "%{$query}%")
                  ->orWhere('barcode', 'like', "%{$query}%");
            })
            ->limit(20)
            ->get()
            ->groupBy('product_id')
            ->map(function ($variants, $productId) {
                $product = $variants->first()->product;
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'variants' => $variants->map(function ($v) {
                        return [
                            'id' => $v->id,
                            'sku' => $v->sku,
                            'price' => (float) $v->price,
                            'stock' => (int) $v->stock_quantity,
                            'color' => $v->color ? $v->color->name : null,
                        ];
                    })->values(),
                ];
            })
            ->values();

        // Merge results, prefer unique by product id
        $merged = collect($products)->keyBy('id');
        foreach ($variantMatches as $hit) {
            if ($merged->has($hit['id'])) {
                // merge variants
                $existing = $merged->get($hit['id']);
                $existingVariants = collect($existing['variants']);
                $newVariants = collect($hit['variants']);
                $existing['variants'] = $existingVariants->merge($newVariants)->unique('id')->values();
                $merged->put($hit['id'], $existing);
            } else {
                $merged->put($hit['id'], $hit);
            }
        }

        return response()->json($merged->values());
    }

    public function scan(Request $request)
    {
        $code = trim((string) $request->input('code'));
        if ($code === '') { return response()->json(null); }

        // Prefer exact matches for snappy scanning
        $variant = ProductVariant::with(['product', 'color'])
            ->where('barcode', $code)
            ->orWhere('sku', $code)
            ->first();
        if ($variant) {
            return response()->json([
                'productId' => $variant->product_id,
                'variantId' => $variant->id,
                'name' => $variant->product->name,
                'sku' => $variant->sku,
                'price' => (float) $variant->price,
                'stock' => (int) $variant->stock_quantity,
                'color' => $variant->color?->name,
            ]);
        }

        $product = Product::where('barcode', $code)->first();
        if ($product) {
            return response()->json([
                'productId' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'stock' => (int) $product->stock_quantity,
            ]);
        }

        return response()->json(null, 404);
    }

    public function createSale(Request $request)
    {
        $data = $request->validate([
            'customer' => 'nullable|array',
            'customer.id' => 'nullable|exists:customers,id',
            'customer.name' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.name' => 'required|string',
            'items.*.sku' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'discount.type' => 'nullable|in:percent,fixed',
            'discount.value' => 'nullable|numeric|min:0',
            'tax.percent' => 'nullable|numeric|min:0',
            'payments' => 'required|array|min:1',
            'payments.*.method' => 'required|string',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.reference' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data) {
            // Customer
            $customerId = null;
            if (!empty($data['customer']['id'])) {
                $customerId = $data['customer']['id'];
            } elseif (!empty($data['customer']['name'])) {
                $customer = Customer::create([
                    'name' => $data['customer']['name'],
                    'phone' => $data['customer']['phone'] ?? null,
                    'email' => $data['customer']['email'] ?? null,
                    'address' => $data['customer']['address'] ?? null,
                    'gstin' => $data['customer']['gstin'] ?? null,
                ]);
                $customerId = $customer->id;
            }

            // Totals
            $subtotal = 0.0;
            foreach ($data['items'] as $item) {
                $subtotal += ((float) $item['price']) * ((int) $item['quantity']);
            }

            $discountType = $data['discount']['type'] ?? null;
            $discountValue = (float) ($data['discount']['value'] ?? 0);
            $discountAmount = 0.0;
            if ($discountType === 'percent') {
                $discountAmount = ($subtotal * $discountValue / 100.0);
            } elseif ($discountType === 'fixed') {
                $discountAmount = $discountValue;
            }

            $taxPercent = (float) ($data['tax']['percent'] ?? 0);
            $taxable = max(0, $subtotal - $discountAmount);
            $taxAmount = $taxPercent > 0 ? ($taxable * $taxPercent / 100.0) : 0.0;
            $total = $taxable + $taxAmount;

            // Create sale
            $sale = Sale::create([
                'customer_id' => $customerId,
                'invoice_number' => static::generateInvoiceNumber(),
                'status' => 'completed',
                'subtotal' => $subtotal,
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'tax_percent' => $taxPercent,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'paid_total' => array_sum(array_map(fn($p) => (float) $p['amount'], $data['payments'])),
            ]);

            // Items + stock deduction
            foreach ($data['items'] as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'name' => $item['name'],
                    'sku' => $item['sku'] ?? null,
                    'quantity' => (int) $item['quantity'],
                    'price' => (float) $item['price'],
                    'line_total' => (float) $item['price'] * (int) $item['quantity'],
                ]);

                // Deduct stock from variant if present, else from product
                if (!empty($item['product_variant_id'])) {
                    $variant = ProductVariant::lockForUpdate()->find($item['product_variant_id']);
                    if ($variant) {
                        $variant->decrement('stock_quantity', (int) $item['quantity']);
                    }
                } else {
                    $product = Product::lockForUpdate()->find($item['product_id']);
                    if ($product) {
                        $product->decrement('stock_quantity', (int) $item['quantity']);
                    }
                }
            }

            // Credit Note Usages (if customer is using store credit)
            $paymentCreditNote = collect($data['payments'])->firstWhere('method', 'credit_note');
            if ($paymentCreditNote && $customerId) {
                $toUseAmount = (float)$paymentCreditNote['amount'];
                // Find active, remaining credit notes, oldest first
                $creditNotes = \App\Models\CreditNote::where('customer_id', $customerId)
                    ->where('status', 'active')->where('remaining_amount', '>', 0)
                    ->orderBy('created_at')->get();
                foreach ($creditNotes as $note) {
                    if ($toUseAmount <= 0) break;
                    $apply = min($note->remaining_amount, $toUseAmount);
                    $note->remaining_amount -= $apply;
                    if ($note->remaining_amount <= 0.001) {
                        $note->status = 'used';
                        $note->remaining_amount = 0;
                    }
                    $note->save();
                    // Save usage in SalePayment (log how much from each note was applied)
                    \App\Models\SalePayment::create([
                        'sale_id' => $sale->id,
                        'method' => 'credit_note',
                        'amount' => $apply,
                        'reference' => 'CreditNote#'.$note->id,
                    ]);
                    $toUseAmount -= $apply;
                }
            }

            // Payments
            foreach ($data['payments'] as $payment) {
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'method' => $payment['method'],
                    'amount' => (float) $payment['amount'],
                    'reference' => $payment['reference'] ?? null,
                ]);
            }

            return response()->json([
                'saleId' => $sale->id,
                'invoiceNumber' => $sale->invoice_number,
            ], 201);
        });
    }

    public function showInvoice($id)
    {
        $sale = Sale::with(['customer', 'items.product', 'items.variant', 'payments'])
            ->findOrFail($id);
        if (request()->query('format') === 'pdf') {
            $pdf = Pdf::loadView('sales.invoice', compact('sale')); // simple A4
            return $pdf->download('invoice-'.$sale->invoice_number.'.pdf');
        }
        return view('sales.invoice', compact('sale'));
    }

    public function processReturn(Request $request, $id)
    {
        $sale = Sale::with(['items'])->findOrFail($id);
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.sale_item_id' => 'required|exists:sale_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Enforce that a customer is attached to the sale before processing returns
        if (!$sale->customer_id) {
            return response()->json(['message' => 'Attach a customer to this invoice before processing return.'], 422);
        }

        return DB::transaction(function () use ($sale, $data) {
            $return = new \App\Models\SaleReturn();
            $return->sale_id = $sale->id;
            $return->reason = request('reason');
            $return->refund_total = 0;
            $return->save();

            $refundTotal = 0;
            foreach ($data['items'] as $ri) {
                $saleItem = $sale->items->firstWhere('id', $ri['sale_item_id']);
                if (!$saleItem) { continue; }
                $qty = min((int) $ri['quantity'], (int) $saleItem->quantity);
                $amount = $qty * (float) $saleItem->price;

                \App\Models\SaleReturnItem::create([
                    'sale_return_id' => $return->id,
                    'sale_item_id' => $saleItem->id,
                    'product_id' => $saleItem->product_id,
                    'product_variant_id' => $saleItem->product_variant_id,
                    'quantity' => $qty,
                    'amount' => $amount,
                ]);

                // increment stock back
                if ($saleItem->product_variant_id) {
                    $variant = ProductVariant::lockForUpdate()->find($saleItem->product_variant_id);
                    if ($variant) { $variant->increment('stock_quantity', $qty); }
                } else {
                    $product = Product::lockForUpdate()->find($saleItem->product_id);
                    if ($product) { $product->increment('stock_quantity', $qty); }
                }

                $refundTotal += $amount;
            }

            $return->refund_total = $refundTotal;
            $return->save();

            // ------- Unified Refund Flow via RefundService ---------
            $customerId = $sale->customer_id;
            if ($refundTotal > 0 && $customerId) {
                /** @var \App\Services\RefundService $refundService */
                $refundService = app(\App\Services\RefundService::class);
                // Create refund request for this POS return and immediately approve/process
                $refund = $refundService->createRefundRequest([
                    'sale_id' => $sale->id,
                    'sale_return_id' => $return->id,
                    'customer_id' => $customerId,
                    'amount' => $refundTotal,
                    'method' => 'credit_note',
                    'reason' => 'POS return processed',
                ]);
                // Approve (will process and issue credit note)
                $refundService->approveRefund($refund);
            }

            // Mark sale as returned if full return
            $soldAmount = $sale->items->sum(fn($i) => (float) $i->price * (int) $i->quantity);
            if ($refundTotal >= $soldAmount) {
                $sale->status = 'returned';
                $sale->save();
            }

            return response()->json(['returnId' => $return->id, 'refundTotal' => $refundTotal]);
        });
    }

    /**
     * Attach or create a customer for an existing sale (before returns).
     */
    public function attachCustomer(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);

        $data = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'name' => 'nullable|string',
            'phone' => 'required_without:customer_id|nullable|string',
            'email' => 'required_without:customer_id|nullable|email',
            'address' => 'nullable|string',
            'gstin' => 'nullable|string',
        ]);

        // If a customer_id is provided, use it; otherwise create a new customer from provided details
        if (!empty($data['customer_id'])) {
            $customer = Customer::findOrFail($data['customer_id']);
        } else {
            $customer = Customer::create([
                'name' => $data['name'] ?? ($data['phone'] ?? 'Customer'),
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'address' => $data['address'] ?? null,
                'gstin' => $data['gstin'] ?? null,
            ]);
        }

        $sale->customer_id = $customer->id;
        $sale->save();

        return response()->json([
            'saleId' => $sale->id,
            'customer' => [ 'id' => $customer->id, 'name' => $customer->name, 'phone' => $customer->phone, 'email' => $customer->email ],
        ]);
    }

    public function report(Request $request)
    {
        $from = $request->date('from');
        $to = $request->date('to');
        $q = Sale::query()->where('status', 'completed');
        if ($from) { $q->whereDate('created_at', '>=', $from); }
        if ($to) { $q->whereDate('created_at', '<=', $to); }
        $sales = $q->get();
        return response()->json([
            'count' => $sales->count(),
            'subtotal' => (float) $sales->sum('subtotal'),
            'tax' => (float) $sales->sum('tax_amount'),
            'total' => (float) $sales->sum('total'),
            'paid' => (float) $sales->sum('paid_total'),
        ]);
    }

    public function holdSale(Request $request)
    {
        // Persist as draft with items; no stock deduction, no payments
        $data = $request->validate([
            'customer' => 'nullable|array',
            'customer.id' => 'nullable|exists:customers,id',
            'customer.name' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.name' => 'required|string',
            'items.*.sku' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'discount.type' => 'nullable|in:percent,fixed',
            'discount.value' => 'nullable|numeric|min:0',
            'tax.percent' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($data) {
            // Optional customer create/use
            $customerId = null;
            if (!empty($data['customer']['id'])) {
                $customerId = $data['customer']['id'];
            } elseif (!empty($data['customer']['name'])) {
                $customer = Customer::create([
                    'name' => $data['customer']['name'],
                    'phone' => $data['customer']['phone'] ?? null,
                    'email' => $data['customer']['email'] ?? null,
                    'address' => $data['customer']['address'] ?? null,
                    'gstin' => $data['customer']['gstin'] ?? null,
                ]);
                $customerId = $customer->id;
            }

            $subtotal = 0.0;
            foreach ($data['items'] as $item) {
                $subtotal += ((float) $item['price']) * ((int) $item['quantity']);
            }

            $discountType = $data['discount']['type'] ?? null;
            $discountValue = (float) ($data['discount']['value'] ?? 0);
            $discountAmount = 0.0;
            if ($discountType === 'percent') {
                $discountAmount = ($subtotal * $discountValue / 100.0);
            } elseif ($discountType === 'fixed') {
                $discountAmount = $discountValue;
            }

            $taxPercent = (float) ($data['tax']['percent'] ?? 0);
            $taxable = max(0, $subtotal - $discountAmount);
            $taxAmount = $taxPercent > 0 ? ($taxable * $taxPercent / 100.0) : 0.0;
            $total = $taxable + $taxAmount;

            $sale = Sale::create([
                'customer_id' => $customerId,
                'invoice_number' => static::generateInvoiceNumber(),
                'status' => 'draft',
                'subtotal' => $subtotal,
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'tax_percent' => $taxPercent,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'paid_total' => 0,
            ]);

            foreach ($data['items'] as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'name' => $item['name'],
                    'sku' => $item['sku'] ?? null,
                    'quantity' => (int) $item['quantity'],
                    'price' => (float) $item['price'],
                    'line_total' => (float) $item['price'] * (int) $item['quantity'],
                ]);
            }

            return response()->json(['saleId' => $sale->id], 201);
        });
    }

    public function resumeSale($id)
    {
        $sale = Sale::with(['customer', 'items'])->where('status', 'draft')->findOrFail($id);
        return response()->json([
            'id' => $sale->id,
            'invoiceNumber' => $sale->invoice_number,
            'customer' => $sale->customer,
            'items' => $sale->items->map(fn($i) => [
                'product_id' => $i->product_id,
                'product_variant_id' => $i->product_variant_id,
                'name' => $i->name,
                'sku' => $i->sku,
                'quantity' => $i->quantity,
                'price' => (float) $i->price,
            ]),
            'discount' => $sale->discount_type ? ['type' => $sale->discount_type, 'value' => (float) $sale->discount_value] : null,
            'tax' => $sale->tax_percent ? ['percent' => (float) $sale->tax_percent] : null,
            'totals' => [
                'subtotal' => (float) $sale->subtotal,
                'tax' => (float) $sale->tax_amount,
                'total' => (float) $sale->total,
            ],
        ]);
    }

    public function finalizeSale(Request $request, $id)
    {
        $sale = Sale::with(['items'])->where('status', 'draft')->findOrFail($id);
        $data = $request->validate([
            'discount.type' => 'nullable|in:percent,fixed',
            'discount.value' => 'nullable|numeric|min:0',
            'tax.percent' => 'nullable|numeric|min:0',
            'payments' => 'required|array|min:1',
            'payments.*.method' => 'required|string',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.reference' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($sale, $data) {
            // Recalculate totals from existing items
            $subtotal = (float) $sale->items->sum(fn($i) => (float) $i->price * (int) $i->quantity);
            $discountType = $data['discount']['type'] ?? $sale->discount_type;
            $discountValue = (float) ($data['discount']['value'] ?? $sale->discount_value ?? 0);
            $discountAmount = 0.0;
            if ($discountType === 'percent') {
                $discountAmount = ($subtotal * $discountValue / 100.0);
            } elseif ($discountType === 'fixed') {
                $discountAmount = $discountValue;
            }

            $taxPercent = (float) ($data['tax']['percent'] ?? $sale->tax_percent ?? 0);
            $taxable = max(0, $subtotal - $discountAmount);
            $taxAmount = $taxPercent > 0 ? ($taxable * $taxPercent / 100.0) : 0.0;
            $total = $taxable + $taxAmount;

            $sale->update([
                'status' => 'completed',
                'subtotal' => $subtotal,
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'tax_percent' => $taxPercent,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'paid_total' => array_sum(array_map(fn($p) => (float) $p['amount'], $data['payments'])),
            ]);

            // Deduct stock
            foreach ($sale->items as $item) {
                if ($item->product_variant_id) {
                    $variant = ProductVariant::lockForUpdate()->find($item->product_variant_id);
                    if ($variant) { $variant->decrement('stock_quantity', (int) $item->quantity); }
                } else {
                    $product = Product::lockForUpdate()->find($item->product_id);
                    if ($product) { $product->decrement('stock_quantity', (int) $item->quantity); }
                }
            }

            // Payments
            foreach ($data['payments'] as $payment) {
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'method' => $payment['method'],
                    'amount' => (float) $payment['amount'],
                    'reference' => $payment['reference'] ?? null,
                ]);
            }

            return response()->json([
                'saleId' => $sale->id,
                'invoiceNumber' => $sale->invoice_number,
            ]);
        });
    }

    public function addCustomer(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'gstin' => 'nullable|string',
        ]);
        $customer = Customer::create($data);
        return response()->json($customer, 201);
    }

    protected static function generateInvoiceNumber(): string
    {
        $prefix = 'INV-';
        $next = str_pad((string) (Sale::max('id') + 1), 6, '0', STR_PAD_LEFT);
        return $prefix . $next;
    }

    /**
     * List completed sales, newest first, for POS Return UI.
     */
    public function listSales(Request $request)
    {
        $query = Sale::query()->with(['customer', 'items'])
            ->where('status', 'completed')
            ->orderByDesc('created_at');

        if ($request->has('invoice_number')) {
            $query->where('invoice_number', 'like', '%'.$request->input('invoice_number').'%');
        }
        if ($request->has('customer_name')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->input('customer_name').'%');
            });
        }
        return response()->json($query->limit(25)->get());
    }

    /**
     * List available credit notes for a given customer (for POS checkout credit note payment UI)
     */
    public function listCreditNotes(Request $request)
    {
        $customerId = $request->input('customer_id');
        if (!$customerId) return response()->json([], 400);
        $notes = \App\Models\CreditNote::where('customer_id', $customerId)
            ->where('status', 'active')
            ->where('remaining_amount', '>', 0)
            ->orderBy('created_at')
            ->get(['id', 'amount', 'remaining_amount', 'reference', 'created_at']);
        return response()->json($notes);
    }
}


