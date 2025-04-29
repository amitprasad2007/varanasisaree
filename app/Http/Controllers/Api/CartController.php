<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    public function addToCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $product = Product::findOrFail($request->product_id);

        // Check if product already exists in cart
        $existingCart = Cart::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->whereNull('order_id')
            ->first();

        if ($existingCart) {
            $existingCart->quantity += $request->quantity;
            $existingCart->amount = $existingCart->quantity * $product->price;
            $existingCart->save();
        } else {
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'price' => $product->price,
                'quantity' => $request->quantity,
                'amount' => $product->price * $request->quantity,
                'status' => 'new'
            ]);
        }

        return response()->json([
            'message' => 'Product added to cart successfully',
            'cart' => $this->getUserCart($user->id)
        ]);
    }

    public function updateCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_id' => 'required|exists:carts,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $cart = Cart::where('id', $request->cart_id)
            ->where('user_id', $user->id)
            ->whereNull('order_id')
            ->firstOrFail();

        $cart->quantity = $request->quantity;
        $cart->amount = $cart->price * $request->quantity;
        $cart->save();

        return response()->json([
            'message' => 'Cart updated successfully',
            'cart' => $this->getUserCart($user->id)
        ]);
    }

    public function removeFromCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_id' => 'required|exists:carts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $cart = Cart::where('id', $request->cart_id)
            ->where('user_id', $user->id)
            ->whereNull('order_id')
            ->firstOrFail();

        $cart->delete();

        return response()->json([
            'message' => 'Product removed from cart successfully',
            'cart' => $this->getUserCart($user->id)
        ]);
    }

    public function getUserCart($userId)
    {
        return Cart::with('product')
            ->where('user_id', $userId)
            ->whereNull('order_id')
            ->get();
    }
} 