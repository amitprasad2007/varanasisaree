<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CustomerService
{
    public function formatCustomerData(Customer $customer)
    {
        return [
            'user' => $this->formatUser($customer),
            'orders' => $this->formatOrders($customer->orders),
            'wishlists' => $this->formatWishlists($customer->wishlists),
            'addresses' => $this->formatAddresses($customer->addresses),
            'cart_items' => $this->formatCartItems($customer->cartItems)
        ];
    }

    private function formatUser(Customer $customer)
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'avatar' => $this->processAvatarUrl($customer->avatar),
            'google_id' => $customer->google_id,
            'created_at' => $customer->created_at->format('Y-m-d H:i:s')
        ];
    }

    private function processAvatarUrl($avatar)
    {
        if (!$avatar) {
            return null;
        }

        // Log the original avatar URL for debugging
        Log::info('Processing avatar URL: ' . $avatar);

        // If it's already a full URL, return as is
        if (filter_var($avatar, FILTER_VALIDATE_URL)) {
            Log::info('Avatar URL is valid: ' . $avatar);
            return $avatar;
        }

        // If it's a relative path, make it absolute
        if (str_starts_with($avatar, 'storage/') || str_starts_with($avatar, 'public/')) {
            $processedUrl = asset($avatar);
            Log::info('Processed relative path to: ' . $processedUrl);
            return $processedUrl;
        }

        // For Google OAuth avatars, ensure they have proper parameters
        if (str_contains($avatar, 'googleusercontent.com')) {
            // Remove existing size parameters and add our preferred size
            $avatar = preg_replace('/[?&]sz=\d+/', '', $avatar);
            $processedUrl = $avatar . (str_contains($avatar, '?') ? '&' : '?') . 'sz=150';
            Log::info('Processed Google avatar to: ' . $processedUrl);
            return $processedUrl;
        }

        Log::info('Returning original avatar URL: ' . $avatar);
        return $avatar;
    }

    private function formatOrders($orders)
    {
        //dd($orders);
        return $orders->map(function ($order) {
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
                'items' => $order->cartItems->map(function ($item) {
                    $images = ($item->product_variant_id ? ($item->productVariant?->primaryImage()?->image_path ?? null) : null)
                    ?? $item->product->resolveImagePaths()->map(function ($path) {
                        $path = (string) $path;
                        if (Str::startsWith($path, ['http://', 'https://', '//'])) {
                            return $path;
                        }
                        return asset('storage/' . ltrim($path, '/'));
                    })->values()
                    ?? 'https://via.placeholder.com/150';
                    return [
                        'id' => $item->product_id,
                        'name' => $item->product->name,
                        'image' => $images,
                        'price' => $item->price,
                        'quantity' => $item->quantity,
                    ];
                })->toArray(),
                'refunds' => $order->refunds->map(function ($refund) {
                    return [
                        'id' => $refund->id,
                        'amount' => $refund->amount,
                        'status' => $refund->status,
                    ];
                })->toArray()
            ];
        });
    }

    private function formatWishlists($wishlists)
    {
        return $wishlists->map(function ($wishlist) {
            $product = $wishlist->product;
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
            return [
                'wish_id'=>$wishlist->id,
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'image' => $images,
                'price' => $product->price,
                'originalPrice' => $product->discount > 0 ? $product->price + $product->discount : null,
                'category' => $product->category->name ?? 'Uncategorized',
            ];
        });
    }

    private function formatAddresses($addresses)
    {
        return $addresses->map(function ($address) {
            $addressLine = $address->address_line1;
            if ($address->address_line2) {
                $addressLine .= ', ' . $address->address_line2;
            }

            return [
                'id' => $address->id,
                'name' => $address->full_name,
                'type' => ucfirst($address->address_type),
                'address' => $addressLine,
                'city' => $address->city,
                'state' => $address->state,
                'postal' => $address->postal_code,
                'phone' => $address->phone,
                'isDefault' => $address->is_default
            ];
        });
    }

    private function formatCartItems($cartItems)
    {
        if ($cartItems->isEmpty()) {
            return [
                'items' => [],
                'subtotal' => 0,
                'discount' => 0,
                'shipping' => 0,
                'tax' => 0,
                'total' => 0
            ];
        }

        $subtotal = $cartItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $tax = round($subtotal * 0.18, 2);
        $discount = round($subtotal * 0.1, 2);
        $shipping = 0;
        $total = ($subtotal + $tax + $shipping) - $discount;

        return [
            'items' => $cartItems->map(function ($item) {
                $images = $item->product->resolveImagePaths()->map(function ($path) {
                    $path = (string) $path;
                    if (Str::startsWith($path, ['http://', 'https://', '//'])) {
                        return $path;
                    }
                    return asset('storage/' . ltrim($path, '/'));
                })->values();
                return [
                    'id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'image' => $images,
                ];
            }),
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $total
        ];
    }
}
