<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Customer;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Notifications\Notification;

class NotificationService
{
    /**
     * Send order status change notification
     */
    public function sendOrderStatusNotification(Order $order, string $newStatus): void
    {
        $customer = $order->customer;
        if (!$customer) {
            return;
        }

        $statusMessages = [
            'pending' => 'Your order has been received and is being processed.',
            'processing' => 'Your order is being prepared for shipment.',
            'shipped' => 'Your order has been shipped and is on its way!',
            'delivered' => 'Your order has been delivered successfully.',
            'cancelled' => 'Your order has been cancelled.',
        ];

        $title = "Order Status Update - {$order->order_id}";
        $message = $statusMessages[$newStatus] ?? "Your order status has been updated to {$newStatus}.";

        // Log the notification for now (we'll implement proper notifications later)
        Log::info('Order status notification sent', [
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'status' => $newStatus,
            'message' => $message
        ]);

        // Send email notification
        try {
            Mail::send('emails.order-status-update', [
                'order' => $order,
                'customer' => $customer,
                'newStatus' => $newStatus,
                'message' => $message,
            ], function ($mail) use ($customer, $title) {
                $mail->to($customer->email, $customer->name)
                     ->subject($title);
            });

            // Log email notification
            Log::info('Order status email sent', [
                'order_id' => $order->id,
                'customer_email' => $customer->email,
                'status' => $newStatus
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send order status email notification', [
                'order_id' => $order->id,
                'customer_id' => $customer->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send AWB assignment notification
     */
    public function sendAwbNotification(Order $order): void
    {
        $customer = $order->customer;
        if (!$customer) {
            return;
        }

        $title = "Shipment Tracking - {$order->order_id}";
        $message = "Your order has been shipped! AWB Number: {$order->awb_number}";

        // Log AWB notification
        Log::info('AWB notification sent', [
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'awb_number' => $order->awb_number,
            'message' => $message
        ]);

        // Send email notification
        try {
            Mail::send('emails.awb-assignment', [
                'order' => $order,
                'customer' => $customer,
            ], function ($mail) use ($customer, $title) {
                $mail->to($customer->email, $customer->name)
                     ->subject($title);
            });

            // Log AWB email notification
            Log::info('AWB email sent', [
                'order_id' => $order->id,
                'customer_email' => $customer->email,
                'awb_number' => $order->awb_number
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send AWB email notification', [
                'order_id' => $order->id,
                'customer_id' => $customer->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send payment confirmation notification
     */
    public function sendPaymentConfirmation(Order $order): void
    {
        $customer = $order->customer;
        if (!$customer) {
            return;
        }

        $title = "Payment Confirmed - {$order->order_id}";
        $message = "Your payment has been confirmed. Your order is now being processed.";

        // Log payment confirmation
        Log::info('Payment confirmation notification sent', [
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'amount' => $order->total_amount,
            'payment_method' => $order->payment_method
        ]);
    }

    /**
     * Send low stock notification to admin
     */
    public function sendLowStockNotification($product, $currentStock): void
    {
        // This would typically send notifications to admin users
        // Implementation depends on your admin notification system
        Log::warning('Low stock alert', [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'current_stock' => $currentStock
        ]);
    }

    /**
     * Mark notification as read (placeholder for future implementation)
     */
    public function markAsRead(int $notificationId): bool
    {
        // Implementation for marking notifications as read
        return true;
    }

    /**
     * Get unread notifications count for customer (placeholder for future implementation)
     */
    public function getUnreadCount($customerId): int
    {
        // Implementation for getting unread count
        return 0;
    }
}
