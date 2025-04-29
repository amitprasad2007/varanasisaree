<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Cart;
use App\Models\Product;
use App\Models\AddressUser;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function buyNow(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'address_id' => 'required|exists:address_users,id',
            'payment_method' => 'required|in:cod,razorpay,paytm,others',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $product = Product::findOrFail($request->product_id);
        $address = AddressUser::findOrFail($request->address_id);

        try {
            DB::beginTransaction();

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $address->id,
                'sub_total' => $product->price * $request->quantity,
                'quantity' => $request->quantity,
                'total_amount' => $product->price * $request->quantity,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cod' ? 'unpaid' : 'paid',
                'status' => 'pending'
            ]);

            // Create cart item for the order
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'order_id' => $order->id,
                'price' => $product->price,
                'quantity' => $request->quantity,
                'amount' => $product->price * $request->quantity,
                'status' => 'new'
            ]);

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

        $user = $request->user();
        $address = AddressUser::findOrFail($request->address_id);
        $cartItems = Cart::where('user_id', $user->id)
            ->whereNull('order_id')
            ->with('product')
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
                'user_id' => $user->id,
                'address_id' => $address->id,
                'sub_total' => $subTotal,
                'quantity' => $quantity,
                'total_amount' => $totalAmount,
                'coupon' => $discount,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cod' ? 'unpaid' : 'paid',
                'status' => 'pending'
            ]);

            // Update cart items with order_id
            Cart::where('user_id', $user->id)
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

    /**
     * List all orders with optional status filter
     */
    public function listOrders(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:pending,shipped,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $query = Order::where('user_id', $user->id)
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
}