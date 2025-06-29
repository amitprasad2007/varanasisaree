<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

class UserService
{
    public function formatUserData(User $user)
    {
        return [
            'user' => $this->formatUser($user),
            'orders' => $this->formatOrders($user->orders),
            'wishlists' => $this->formatWishlists($user->wishlists),
            'addresses' => $this->formatAddresses($user->addresses),
            'cart_items' => $this->formatCartItems($user->cartItems)
        ];
    }

    private function formatUser(User $user)
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'created_at' => $user->created_at->format('Y-m-d H:i:s')
        ];
    }

    private function formatOrders($orders)
    {
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
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'id' => $item->product_id,
                        'name' => $item->product->name,
                        'image' => $item->product->primaryImage->first()?->image_path ?? 'https://via.placeholder.com/150',
                        'price' => $item->price,
                        'quantity' => $item->quantity,
                    ];
                })->toArray()
            ];
        });
    }

    private function formatWishlists($wishlists)
    {
        return $wishlists->map(function ($wishlist) {
            $product = $wishlist->product;
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'image' => $product->primaryImage->first()?->image_path ?? 'https://via.placeholder.com/150',
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
        $subtotal = $cartItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $tax = $subtotal * 0.18;
        $discount = 5000;
        $shipping = 0;
        $total = $subtotal + $tax + $shipping - $discount;

        return [
            'items' => $cartItems->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'image' => $item->product->primaryImage->first()?->image_path ?? 'https://via.placeholder.com/150',
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
