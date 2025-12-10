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
                ->firstOrFail();
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
            ->firstOrFail();

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
            ->firstOrFail();

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
           // dd($item->productVariant->color->name);
            return [
                'id' => $item->id,
                'name' => $item->product->name ?? '',
                'slug' => $item->product->slug ?? '',
                'category' => $item->product->category->id ?? '',
                'subcategory' => $item->product->subcategory->id ?? '',
                'image' => ($item->product_variant_id ? ($item->productVariant?->primaryImage()?->image_path ?? $item->productVariant->image_path?? null) : null)
                    ?? $item->product->primaryImage->first()?->image_path
                    ?? 'https://via.placeholder.com/150',
                'price' => $item->price,
                'originalPrice' => $item->product->original_price ?? $item->price, // fallback if not available
                'quantity' => $item->quantity,
                'color' => ($item->product_variant_id ? ($item->productVariant->color->name ??  null) : null) ?? $item->product->color ?? '',
                'maxQuantity' => $item->product->max_quantity ?? 10, // fallback if not available
            ];
        });

        // Calculate cart summary
        $subTotal = $cartItems->sum('price');
        $quantity = $cartItems->sum('quantity');
        $tax = round($subTotal * 0.18, 2);
        $discount = min(round($subTotal * 0.1, 2), 5000);
        $shipping = ($subtotal > 50000) ? 0 : 499; // You can implement shipping calculation logic here
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
    public function getRecommendedProducts(Request $request)
    {
        $customer = $request->user();
        $cartItems = Cart::where('customer_id', $customer->id)
                ->whereNull('order_id')
                ->with('product')
                ->get();
        $cartproductIds = $cartItems->pluck('product_id')->toArray();
        $recentproducts = RecentView::where('customer_id', $customer->id)
            ->with(['product'])
            ->whereNotIn('product_id', $cartproductIds)
            ->latest()
            ->take(5)
            ->get();
        $whislistproducts = Wishlist::where('customer_id', $customer->id)
            ->with(['product'])
            ->whereNotIn('product_id', $cartproductIds)
            ->latest()
            ->take(5)
            ->get();
        $mergedProducts = $recentproducts->merge($whislistproducts);
        $onlyProducts = $mergedProducts->pluck(['product'])->filter();
       if(count ($onlyProducts) <10){

            $categoryIds = $cartItems->pluck('product.category_id')->unique()->filter();
            $subcategoryIds = $cartItems->pluck('product.subcategory_id')->unique()->filter();
            $additionalProducts = Product::where(function ($query) use ($categoryIds, $subcategoryIds) {
                    if ($categoryIds->isNotEmpty()) {
                        $query->whereIn('category_id', $categoryIds);
                    }
                    if ($subcategoryIds->isNotEmpty()) {
                        $query->orWhereIn('subcategory_id', $subcategoryIds);
                    }
                })
                ->where('status', 'active')
                ->whereNotIn('id', array_merge($cartproductIds, $onlyProducts->pluck('id')->toArray()))
                ->inRandomOrder()
                ->take(10 - count($onlyProducts))
                ->get();
            $onlyProducts = $onlyProducts->merge($additionalProducts);
       }
       
        $formattedProducts = $onlyProducts->map(function ($product) {
            $reviewStats = ProductReview::where('product_id', $product->id)
            ->select('product_id', DB::raw('COUNT(*) as review_count'), DB::raw('AVG(rating) as avg_rating'))
            ->whereIn('product_id', $product->pluck('id'))
            ->where('status', 'approved')
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

            // Prices
            $basePrice = (float) $product->price;
            $discountPercent = (float) ($product->discount ?? 0);
            $finalPrice = $basePrice - ($basePrice * $discountPercent / 100);

            // Images (resolve and convert to absolute URLs)
            $images = $product->resolveImagePaths()->map(function ($path) {
                $path = (string) $path;
                if (Str::startsWith($path, ['http://', 'https://', '//'])) {
                    return $path;
                }
                return asset('storage/' . ltrim($path, '/'));
            })->values();

            // Skip products with no images
            if ($images->isEmpty()) {
                return null;
            }

            // Reviews
            $stats = $reviewStats->get($product->id);
            $avgRating = $stats ? (float) $stats->avg_rating : 0.0;
            $reviewCount = $stats ? (int) $stats->review_count : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'images' => $images,
                'price' => (int) round($finalPrice),
                'originalPrice' => $discountPercent > 0 ? (int) round($basePrice) : null,
                'rating' => round($avgRating, 1),
                'reviewCount' => $reviewCount,
                'category' => optional($product->category)->title,
                'isNew' => $product->created_at ? $product->created_at->gt(now()->subDays(30)) : false,
                'isBestseller' => (bool) ($product->is_bestseller ?? false),
            ];
        });

        return response()->json(['recommended_products' => $formattedProducts]);
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
                ->firstOrFail();
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
