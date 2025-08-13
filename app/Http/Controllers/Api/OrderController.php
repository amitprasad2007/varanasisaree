<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Cart;
use App\Models\Product;
use App\Models\AddressUser;
use App\Models\Coupon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function buyNow(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'variant_id' => 'nullable|exists:product_variants,id',
            'address_id' => 'required|exists:address_users,id',
            'payment_method' => 'required|in:cod,razorpay,paytm,others',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer = $request->user();
        $product = Product::findOrFail($request->product_id);
        $variant = null;
        if ($request->filled('variant_id')) {
            $variant = \App\Models\ProductVariant::where('id', $request->variant_id)
                ->where('product_id', $product->id)
                ->firstOrFail();
        }
        $address = AddressUser::findOrFail($request->address_id);

        try {
            DB::beginTransaction();

            // Create order
            $unitPrice = $variant ? ($variant->final_price ?? $variant->price) : $product->price;
            $order = Order::create([
                'customer_id' => $customer->id,
                'address_id' => $address->id,
                'sub_total' => $unitPrice * $request->quantity,
                'quantity' => $request->quantity,
                'total_amount' => $unitPrice * $request->quantity,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cod' ? 'unpaid' : 'paid',
                'status' => 'pending'
            ]);

            // Create cart item for the order
            Cart::create([
                'customer_id' => $customer->id,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'order_id' => $order->id,
                'price' => $unitPrice,
                'quantity' => $request->quantity,
                'amount' => $unitPrice * $request->quantity,
                'status' => 'new'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order->load(['cartItems.product', 'cartItems.productVariant'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to place order', 'error' => $e->getMessage()], 500);
        }
    }

    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'address_id' => 'required|exists:address_users,id',
            'payment_method' => 'required|in:cod,razorpay,paytm,others',
            'coupon_code' => 'nullable|exists:coupons,code'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer = $request->user();
        $address = AddressUser::findOrFail($request->address_id);
        $cartItems = Cart::where('customer_id', $customer->id)
            ->whereNull('order_id')
            ->with(['product', 'productVariant'])
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        try {
            DB::beginTransaction();

            // Calculate totals
            $subTotal = $cartItems->sum('amount');
            $quantity = $cartItems->sum('quantity');
            $discount = 0;

            // Apply coupon if provided
            if ($request->coupon_code) {
                $coupon = Coupon::where('code', $request->coupon_code)->first();
                if ($coupon) {
                    $discount = $coupon->calculateDiscount($subTotal);
                }
            }

            $totalAmount = $subTotal - $discount;

            // Create order
            $order = Order::create([
                'order_id' => 'ORD-' . strtoupper(uniqid()), // Generate a unique order ID
                'customer_id' => $customer->id,
                'address_id' => $address->id,
                'sub_total' => $subTotal,
                'shipping_id' => 1, // Assuming a fixed shipping ID for this example
                'quantity' => $quantity,
                'total_amount' => $totalAmount,
                'coupon' => $discount,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cod' ? 'unpaid' : 'paid',
                'status' => 'pending',
                'transaction_id' => $request->payment_method === 'razorpay' ? $request->razorpay_payment_id : null,
                'payment_details' => json_encode($request->all())
            ]);

            // Update cart items with order_id
            Cart::where('customer_id', $customer->id)
                ->whereNull('order_id')
                ->update(['order_id' => $order->id]);

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order->load('cartItems.product')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to place order', 'error' => $e->getMessage()], 500);
        }
    }

    public function listOrders(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:pending,shipped,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer = $request->user();
        $query = Order::where('customer_id', $customer->id)
            ->with(['cartItems.product', 'address'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->get();

        return response()->json([
            'orders' => $orders
        ]);
    }

    public function getOrderHistory(Request $request)
    {
        $customer = $request->user();

        $orders = Order::where('customer_id', $customer->id)
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $statusColor = match($order->status) {
                    'delivered' => 'bg-green-500',
                    'processing' => 'bg-amber-500',
                    'pending' => 'bg-blue-500',
                    'shipped' => 'bg-purple-500',
                    'cancelled' => 'bg-red-500',
                    default => 'bg-gray-500'
                };

                return [
                    'id' => $order->order_id,
                    'date' => $order->created_at->format('d M Y'),
                    'total' => $order->total_amount,
                    'status' => ucfirst($order->status),
                    'statusColor' => $statusColor,
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->product_id,
                            'name' => $item->product->name,
                            'image' => $item->product->primaryImage->first()?->image_url ?? 'https://via.placeholder.com/150',
                            'price' => $item->price,
                            'quantity' => $item->quantity,
                        ];
                    })->toArray()
                ];
            });

        return response()->json($orders);
    }

    public function orderdetails(Request $request,$orid){
        $orderdetails = Order::where('order_id',$orid)->with(['address','orderItems.product.imageproducts','payment'])->get();

        if (!$orderdetails) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $formattedOrder = $orderdetails->map(function($item) {
            return [
                'order_id' => $item->order_id,
                'order_date' => $item->created_at,
                'order_status' => $item->status,
                'order_total' => $item->total_amount,
                'order_address' => $item->address->address_line1 . ' ' . $item->address->address_line2,
                'order_city' => $item->address->city,
                'shippingcost' => $item->shippingcost,
                'sub_total' => $item->sub_total,
                'name'=> auth()->user()->name,
                'order_state' => $item->address->state,
                'order_zip' => $item->address->postal_code,
                'order_country' => $item->address->country,
                'order_phone' => auth()->user()->phone,
                'order_email' => $item->customer->email,
                'payment_status'=> $item->payment_status,
                'tax'=> $item->tax,
                'payment_method' => $item->payment_method,
                'payment_online_details' => $item->payment ? $item->payment->payment_details->toArray() : [],
                'invoice_download_url' => route('api.order.pdf', $item->order_id),
                'order_items' => $item->orderItems->map(function($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'product_image' => $item->product->imageproducts->first() ? asset('storage/products/photos/thumbnails/'.$item->product->imageproducts->first()->photo_path) : null,
                        'product_price' => $item->product->price,
                        'product_discount' => $item->product->discount,
                        'product_price_after_discount' => $item->product->price - ($item->product->price * $item->product->discount) / 100,
                        'product_quantity' => $item->quantity,
                    ];
                })
            ];
        });
        return response()->json($formattedOrder);
    }
}
