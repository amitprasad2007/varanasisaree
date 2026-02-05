<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use App\Models\RecentView;
use App\Models\Wishlist;
use App\Models\ProductReview;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function addToCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

		$customer = $request->user();
        $product = Product::findOrFail($request->product_id);

        $variantId = $request->input('variant_id');
        $variant = null;
        if ($variantId) {
            $variant = \App\Models\ProductVariant::where('id', $variantId)
                ->where('product_id', $product->id)
                ->first();

            if (!$variant) {
                return response()->json(['message' => 'Invalid variant selected for this product.'], 422);
            }
        }

        // Check if product already exists in cart
		$existingCart = Cart::where('customer_id', $customer->id)
            ->where('product_id', $product->id)
            ->when($variantId, function ($q) use ($variantId) {
                $q->where('product_variant_id', $variantId);
            }, function ($q) {
                $q->whereNull('product_variant_id');
            })
			->whereNull('order_id')
            ->first();

        if ($existingCart) {
            $existingCart->quantity += $request->quantity;
            $unitPrice = $variant ? ($variant->final_price ?? $variant->price) : $product->price;
            $existingCart->price = $unitPrice;
            $existingCart->amount = $existingCart->quantity * $unitPrice;
            $existingCart->save();
        } else {
            $unitPrice = $variant ? ($variant->final_price ?? $variant->price) : $product->price;
			Cart::create([
				'customer_id' => $customer->id,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'price' => $unitPrice,
                'quantity' => $request->quantity,
                'amount' => $unitPrice * $request->quantity,
                'status' => 'new'
            ]);
        }

        // After adding or updating the cart, fetch the latest cart item for this product
		$cartItem = Cart::with(['product', 'productVariant', 'productVariant.images'])
			->where('customer_id', $customer->id)
            ->where('product_id', $product->id)
            ->when($variantId, function ($q) use ($variantId) {
                $q->where('product_variant_id', $variantId);
            }, function ($q) {
                $q->whereNull('product_variant_id');
            })
            ->whereNull('order_id')
            ->latest('updated_at')
            ->first();

		return response()->json([
            'message' => 'Product added to cart successfully',
            'item' => [
                'id' => $cartItem->id,
                'product_id' => $cartItem->product_id,
                'variant_id' => $cartItem->product_variant_id,
                'quantity' => $cartItem->quantity,
                'name' => $cartItem->product->name ?? '',
                'price' => $cartItem->price,
                'image' => ($cartItem->product_variant_id ? ($cartItem->productVariant?->primaryImage()?->image_path ?? null) : null)
                    ?? $cartItem->product->primaryImage->first()?->image_url
                    ?? 'https://via.placeholder.com/150',
                'color' => $cartItem->product->color ?? '',
                'slug' => $cartItem->product->slug ?? '',
            ]
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

		$customer = $request->user();
		$cart = Cart::where('id', $request->cart_id)
			->where('customer_id', $customer->id)
            ->whereNull('order_id')
            ->first();

        $cart->quantity = $request->quantity;
        $cart->amount = $cart->price * $request->quantity;
        $cart->save();

		return response()->json([
            'message' => 'Cart updated successfully',
			'cart' => $this->getCustomerCart($customer->id)
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

		$customer = $request->user();
		$cart = Cart::where('id', $request->cart_id)
			->where('customer_id', $customer->id)
            ->whereNull('order_id')
            ->first();

        $cart->delete();

		return response()->json([
            'message' => 'Product removed from cart successfully',
			'cart' => $this->getCustomerCart($customer->id)
        ]);
    }

	public function getCustomerCart($customerId)
    {
		return Cart::with(['product', 'product.primaryImage', 'productVariant', 'productVariant.images'])
			->where('customer_id', $customerId)
            ->whereNull('order_id')
            ->get();
    }

	public function getCheckoutCart(Request $request)
    {
		$customer = $request->user();
		$cartItems = $this->getCustomerCart($customer->id);

        // Map cart items to the required format
        $formattedCartItems = $cartItems->map(function ($item) {
            return [
                'id' => $item->product_id,
                'cart_id' => $item->id,
                'variant_id' => $item->product_variant_id,
                'name' => $item->product->name ?? '',
                'slug' => $item->product->slug ?? '',
                'category' => $item->product->category->id ?? '',
                'subcategory' => $item->product->subcategory->id ?? '',
                'image' => ($item->product_variant_id ? ($item->productVariant?->primaryImage()?->image_path ?? $item->productVariant->image_path ?? null) : null)
                    ?? $item->product->resolveImagePaths()->first()
                    ?? 'https://via.placeholder.com/150',
                'price' => $item->price,
                'originalPrice' => $item->product->original_price ?? $item->price, // fallback if not available
                'quantity' => $item->quantity,
                'color' => ($item->product_variant_id ? ($item->productVariant->color->name ??  null) : null) ?? $item->product->color ?? '',
                'maxQuantity' => $item->product->max_quantity ?? 10, // fallback if not available
            ];
        });

        $subTotal = $cartItems->sum('amount');
        $quantity = $cartItems->sum('quantity');
        $tax = round($subTotal * 0.18, 2);
        $discount = min(round($subTotal * 0.1, 2), 5000);
        $shipping = ($subTotal > 50000) ? 0 : 499; // You can implement shipping calculation logic here
        $total = ($subTotal + $tax + $shipping) - $discount;
		$cartdetails = $this->getCustomerCart($customer->id);
        return response()->json([
            'cartdetails' => $cartdetails,
            'cart_items' => $formattedCartItems,
            'summary' => [
                'sub_total' => $subTotal,
                'quantity' => $quantity,
                'tax' => $tax,
                'discount' => $discount,
                'shipping' => $shipping,
                'total' => $total
            ]
        ]);
    }

	public function getCartSummary(Request $request)
    {
		$customer = $request->user()->load('addressesdefault');

		$cartItems = Cart::where('customer_id', $customer->id)
            ->whereNull('order_id')
            ->with('product')
            ->get();

        $subtotal = $cartItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        // Calculate tax (assuming 18% GST)
        $tax = round($subtotal * 0.18, 2);

        // For this example, we'll use a fixed discount
        $discount = min(round($subtotal * 0.1, 2), 5000);

        // Free shipping for this example
        $shipping = ($subtotal > 50000) ? 0 : 499;

        $total = ($subtotal + $tax + $shipping) - $discount;

        $formattedItems = $cartItems->map(function ($item) {
            return [
                'cart_id' => $item->id,
                'id' => $item->product_id,
                'variant_id' => $item->product_variant_id,
                'name' => $item->product->name,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'image' => ($item->product_variant_id ? ($item->productVariant?->primaryImage()?->image_path ?? $item->productVariant->image_path?? null) : null)
                ?? $item->product->primaryImage->first()?->image_path
                ?? 'https://via.placeholder.com/150',
                'color' => ($item->product_variant_id ? ($item->productVariant->color->name ??  null) : null) ?? $item->product->color ?? '',
                'slug' => $item->product->slug ?? '',
            ];
        });

		return response()->json([
			'address' => $customer->addressesdefault,
            'items' => $formattedItems,
            'subtotal' => $subtotal,
            'quantity' => $cartItems->sum('quantity'),
            'discount' => $discount,
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $total
        ]);
    }

    public function wishaddToCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'wishlistId' => 'required|exists:wishlists,id',            
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

		$customer = $request->user();
        $product = Product::findOrFail($request->product_id);

        $wishlist =  Wishlist::find($request->wishlistId);
        $variantId = $wishlist->product_variant_id;

        $variant = null;
        if ($variantId) {
            $variant = \App\Models\ProductVariant::where('id', $variantId)
                ->where('product_id', $product->id)
                ->first();

            if (!$variant) {
                return response()->json(['message' => 'Invalid variant selected for this product.'], 422);
            }
        }

        // Check if product already exists in cart
		$existingCart = Cart::where('customer_id', $customer->id)
            ->where('product_id', $product->id)
            ->when($variantId, function ($q) use ($variantId) {
                $q->where('product_variant_id', $variantId);
            }, function ($q) {
                $q->whereNull('product_variant_id');
            })
			->whereNull('order_id')
            ->first();

        if ($existingCart) {
            $existingCart->quantity += $request->quantity;
            $unitPrice = $variant ? ($variant->final_price ?? $variant->price) : $product->price;
            $existingCart->price = $unitPrice;
            $existingCart->amount = $existingCart->quantity * $unitPrice;
            $existingCart->save();
        } else {
            $unitPrice = $variant ? ($variant->final_price ?? $variant->price) : $product->price;
			Cart::create([
				'customer_id' => $customer->id,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'price' => $unitPrice,
                'quantity' => $request->quantity,
                'amount' => $unitPrice * $request->quantity,
                'status' => 'new'
            ]);
        }

        // After adding or updating the cart, fetch the latest cart item for this product
		$cartItem = Cart::with(['product', 'productVariant', 'productVariant.images'])
			->where('customer_id', $customer->id)
            ->where('product_id', $product->id)
            ->when($variantId, function ($q) use ($variantId) {
                $q->where('product_variant_id', $variantId);
            }, function ($q) {
                $q->whereNull('product_variant_id');
            })
            ->whereNull('order_id')
            ->latest('updated_at')
            ->first();

		return response()->json([
            'message' => 'Product added to cart successfully',
            'item' => [
                'id' => $cartItem->id,
                'product_id' => $cartItem->product_id,
                'variant_id' => $cartItem->product_variant_id,
                'quantity' => $cartItem->quantity,
                'name' => $cartItem->product->name ?? '',
                'price' => $cartItem->price,
                'image' => ($cartItem->product_variant_id ? ($cartItem->productVariant?->primaryImage()?->image_path ?? null) : null)
                    ?? $cartItem->product->primaryImage->first()?->image_url
                    ?? 'https://via.placeholder.com/150',
                'color' => $cartItem->product->color ?? '',
                'slug' => $cartItem->product->slug ?? '',
            ]
        ]);

    }
}
