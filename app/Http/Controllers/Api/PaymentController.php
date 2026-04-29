<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Razorpay\Api\Api;

class PaymentController extends Controller
{
    public function createOrder(Request $request)
    {
        $customer = Auth::user();
        $isBuyNow = $request->input('is_buy_now', false);

        try {
            DB::beginTransaction();

            $subTotal = 0;
            $quantity = 0;
            $discount = 0;
            $orderItemsToCreate = [];
            $cartItemsToUpdate = collect();

            if ($isBuyNow) {
                // Securely fetch single product
                $productItem = $request->items[0] ?? null;
                if (! $productItem) {
                    return response()->json(['message' => 'Product details missing'], 422);
                }

                $product = Product::with('category')->findOrFail($productItem['id']);

                // Than validation
                $categorySlug = strtolower($product->category->slug ?? '');
                $productSlug = strtolower($product->slug ?? '');
                $isThan = in_array($categorySlug, ['than', 'thaan']) ||
                          str_contains($categorySlug, 'than') ||
                          str_contains($categorySlug, 'fabric') ||
                          str_starts_with($productSlug, 'than-') ||
                          str_starts_with($productSlug, 'fabric-');

                if ($isThan && $productItem['quantity'] < 15) {
                    return response()->json([
                        'message' => 'Minimum order quantity for Than items is 15 meters.',
                    ], 422);
                }

                $variant = null;
                if (! empty($productItem['variant_id'])) {
                    $variant = ProductVariant::where('id', $productItem['variant_id'])
                        ->where('product_id', $product->id)
                        ->first();
                }

                $unitPrice = $variant ? ($variant->final_price ?? $variant->price) : $product->price;
                $subTotal = $unitPrice * $productItem['quantity'];
                $quantity = $productItem['quantity'];

                $orderItemsToCreate[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'quantity' => $quantity,
                    'price' => $unitPrice,
                ];

            } else {
                // Securely fetch cart
                $cartItems = Cart::where('customer_id', $customer->id)
                    ->whereNull('order_id')
                    ->with(['product', 'productVariant'])
                    ->get();

                if ($cartItems->isEmpty()) {
                    return response()->json(['message' => 'Cart is empty'], 400);
                }

                foreach ($cartItems as $item) {
                    $categorySlug = strtolower($item->product->category->slug ?? '');
                    $productSlug = strtolower($item->product->slug ?? '');

                    $isThan = in_array($categorySlug, ['than', 'thaan']) ||
                              str_contains($categorySlug, 'than') ||
                              str_contains($categorySlug, 'fabric') ||
                              str_starts_with($productSlug, 'than-') ||
                              str_starts_with($productSlug, 'fabric-');

                    if ($isThan && $item->quantity < 15) {
                        return response()->json([
                            'message' => "Your cart contains '{$item->product->name}' which requires a minimum order of 15 meters.",
                        ], 422);
                    }

                    $orderItemsToCreate[] = [
                        'product_id' => $item->product_id,
                        'product_variant_id' => $item->product_variant_id,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                    ];
                }

                $cartItemsToUpdate = $cartItems;
                $subTotal = $cartItems->sum('amount');
                $quantity = $cartItems->sum('quantity');
            }

            // Apply coupon
            if ($request->coupon_code) {
                $coupon = Coupon::where('code', $request->coupon_code)->first();
                if ($coupon) {
                    $discount = $coupon->calculateDiscount($subTotal);
                }
            }

            $shippingCost = $request->shippingcost ?? 0;
            $tax = $request->tax ?? 0;
            $finalTotal = $subTotal - $discount + $shippingCost + $tax;

            $order = Order::create([
                'order_id' => 'ORD-'.date('YmdHis').'-'.bin2hex(random_bytes(5)),
                'customer_id' => $customer->id,
                'address_id' => $request->address_id,
                'shipping_id' => 1,
                'sub_total' => $subTotal,
                'quantity' => $quantity,
                'shipping_cost' => $shippingCost,
                'tax' => $tax,
                'discount' => $discount,
                'total_amount' => $finalTotal,
                'payment_method' => 'razorpay',
                'payment_status' => 'unpaid',
                'status' => 'pending',
                'shipping_notes' => $request->shipping_notes,
                'coupon' => $request->coupon_code,
            ]);

            foreach ($orderItemsToCreate as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            foreach ($cartItemsToUpdate as $cartItem) {
                $cartItem->update([
                    'order_id' => $order->id,
                    'status' => 'progress',
                ]);
            }

            // Create Razorpay Order
            $amounttotal = round($finalTotal * 100);

            $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
            $orderData = [
                'receipt' => $order->order_id,
                'amount' => $amounttotal,
                'currency' => 'INR',
                'payment_capture' => 1,
                'notes' => ['customer_name' => $customer->name, 'Customer_mobile' => $customer->phone],
            ];

            $rzorder = $api->order->create($orderData);

            if (! $rzorder || ! isset($rzorder->id)) {
                Log::error('Razorpay order creation failed:', ['response' => $rzorder]);
                DB::rollBack();

                return response()->json(['message' => 'Failed to create Razorpay order'], 500);
            }

            $order->transaction_id = $rzorder->id;
            $order->payment_details = json_encode($rzorder->toArray());
            $order->save();

            DB::commit();

            return response()->json([
                'razorpayOrderId' => $rzorder->id,
                'orderId' => $order->order_id,
                'amount' => $amounttotal,
                'currency' => 'INR',
                'rzdetails' => $rzorder->toArray(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation exception:', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Failed to create order', 'error' => $e->getMessage()], 500);
        }
    }

    public function paychecksave(Request $request)
    {
        $customer = Auth::user();
        $payment_id = $request->response['razorpay_payment_id'];
        $order_id = $request->response['razorpay_order_id'];

        $order = Order::where('transaction_id', $order_id)->first();
        if (! $order) {
            return response()->json(['success' => false, 'message' => 'Order not found for transaction'], 404);
        }

        $totalamount = round($order->total_amount * 100); // Secure calculation

        $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
        $payment = $api->payment->fetch($payment_id);

        if ($payment->status === 'captured') {
            $payment_save = Payment::create([
                'payment_id' => $payment->id,
                'amount' => $payment->amount,
                'status' => $payment->status,
                'method' => $payment->method,
                'order_id' => $payment->description,
                'rzorder_id' => $payment->order_id,
                'card_id' => $payment->card_id,
                'email' => $payment->email,
                'contact' => $payment->contact,
                'customer_id' => $customer->id,
                'payment_details' => json_encode($payment->toArray()),
            ]);
            $order->update(['payment_status' => 'paid', 'status' => 'processing']);

            return response()->json([
                'orderId' => $payment->description,
                'success' => true,
            ]);
        } else {
            $response = $payment->capture(['amount' => $totalamount]);
            $payment_save = Payment::create([
                'payment_id' => $response->id,
                'amount' => $response->amount,
                'status' => $response->status,
                'method' => $response->method,
                'order_id' => $response->description,
                'rzorder_id' => $response->order_id,
                'card_id' => $response->card_id,
                'email' => $response->email,
                'contact' => $response->contact,
                'customer_id' => $customer->id,
                'payment_details' => json_encode($response->toArray()),
            ]);
            $order->update(['payment_status' => 'paid', 'status' => 'processing']);

            return response()->json([
                'orderId' => $response->description,
                'success' => true,
            ]);
        }
    }

    public function getPaymentMethods()
    {
        return response()->json([
            'payment_methods' => [
                ['id' => 'cod', 'type' => 'COD', 'name' => 'Cash on Delivery'],
                ['id' => 'online', 'type' => 'ONLINE', 'name' => 'Online Payment'],
            ],
        ]);
    }
}
