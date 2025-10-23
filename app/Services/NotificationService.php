<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

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

        // Create notification record in database
        $notification = Notification::create([
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'type' => 'order_status_update',
            'title' => $title,
            'message' => $message,
            'data' => [
                'status' => $newStatus,
                'order_id' => $order->order_id,
            ],
        ]);

        // Log the notification creation
        Log::info('Order status notification created', [
            'notification_id' => $notification->id,
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'status' => $newStatus,
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

            // Mark email as sent
            $notification->markEmailSent();

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

        // Create notification record in database
        $notification = Notification::create([
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'type' => 'awb_assigned',
            'title' => $title,
            'message' => $message,
            'data' => [
                'awb_number' => $order->awb_number,
                'tracking_number' => $order->tracking_number,
                'order_id' => $order->order_id,
            ],
        ]);

        // Log AWB notification
        Log::info('AWB notification created', [
            'notification_id' => $notification->id,
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'awb_number' => $order->awb_number,
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

            // Mark email as sent
            $notification->markEmailSent();

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

        // Create notification record in database
        $notification = Notification::create([
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'type' => 'payment_confirmed',
            'title' => $title,
            'message' => $message,
            'data' => [
                'amount' => $order->total_amount,
                'payment_method' => $order->payment_method,
                'order_id' => $order->order_id,
            ],
        ]);

        // Log payment confirmation
        Log::info('Payment confirmation notification created', [
            'notification_id' => $notification->id,
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'amount' => $order->total_amount,
            'payment_method' => $order->payment_method
        ]);

        // Send email notification
        try {
            Mail::send('emails.payment-confirmation', [
                'order' => $order,
                'customer' => $customer,
                'message' => $message,
            ], function ($mail) use ($customer, $title) {
                $mail->to($customer->email, $customer->name)
                     ->subject($title);
            });

            // Mark email as sent
            $notification->markEmailSent();

            Log::info('Payment confirmation email sent', [
                'order_id' => $order->id,
                'customer_email' => $customer->email,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send payment confirmation email', [
                'order_id' => $order->id,
                'customer_id' => $customer->id,
                'error' => $e->getMessage()
            ]);
        }
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
     * Mark notification as read
     */
    public function markAsRead(int $notificationId): bool
    {
        try {
            $notification = Notification::find($notificationId);
            if ($notification) {
                $notification->markAsRead();
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to mark notification as read', [
                'notification_id' => $notificationId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get unread notifications count for customer
     */
    public function getUnreadCount($customerId): int
    {
        try {
            return Notification::where('customer_id', $customerId)
                ->unread()
                ->count();
        } catch (\Exception $e) {
            Log::error('Failed to get unread count', [
                'customer_id' => $customerId,
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }

    /**
     * Get notifications for a customer
     */
    public function getCustomerNotifications(int $customerId, int $limit = 10)
    {
        return Notification::where('customer_id', $customerId)
            ->with('order')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get notifications for an order
     */
    public function getOrderNotifications(int $orderId)
    {
        return Notification::where('order_id', $orderId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
