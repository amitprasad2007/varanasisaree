<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class OrderManagementController extends Controller
{
    protected $notificationService;
    protected $inventoryService;

    public function __construct(NotificationService $notificationService, InventoryService $inventoryService)
    {
        $this->notificationService = $notificationService;
        $this->inventoryService = $inventoryService;
    }

    /**
     * Display a listing of orders with filters
     */
    public function index(Request $request): Response
    {
        $query = Order::with([
            'customer:id,name,email,phone',
            'address',
            'productItems.product:id,name,slug',
            'productItems.variant:id,color,size',
            'assignedTo:id,name',
            'statusLogs' => function($query) {
                $query->latest()->limit(1);
            }
        ]);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('customer_search')) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->customer_search . '%')
                  ->orWhere('email', 'like', '%' . $request->customer_search . '%')
                  ->orWhere('phone', 'like', '%' . $request->customer_search . '%');
            });
        }

        if ($request->filled('order_id')) {
            $query->where('order_id', 'like', '%' . $request->order_id . '%');
        }

        if ($request->filled('priority')) {
            $query->where('order_priority', $request->priority);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $orders = $query->paginate(20)->withQueryString();

        // Get filter options
        $statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        $paymentStatusOptions = ['paid', 'unpaid'];
        $priorityOptions = ['low', 'normal', 'high', 'urgent'];
        $assignedUsers = User::select('id', 'name')->get();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only([
                'status', 'payment_status', 'date_from', 'date_to',
                'customer_search', 'order_id', 'priority', 'assigned_to',
                'sort_by', 'sort_direction'
            ]),
            'statusOptions' => $statusOptions,
            'paymentStatusOptions' => $paymentStatusOptions,
            'priorityOptions' => $priorityOptions,
            'assignedUsers' => $assignedUsers,
        ]);
    }

    /**
     * Display the specified order with full details
     */
    public function show(Order $order): Response
    {
        $order->load([
            'customer',
            'address',
            'productItems.product.imageproducts',
            'productItems.variant',
            'assignedTo',
            'statusLogs.changedBy',
            'payment',
            'notifications'
        ]);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        // Update order status with logging
        $order->updateStatus($newStatus, $request->notes, auth()->id());

        // Handle inventory based on status change
        if ($newStatus === 'processing' && $oldStatus === 'pending') {
            // Reserve inventory when order is confirmed
            $this->inventoryService->reserveInventory($order);
        } elseif ($newStatus === 'cancelled' && in_array($oldStatus, ['pending', 'processing'])) {
            // Release inventory when order is cancelled
            $this->inventoryService->releaseInventory($order);
        }

        // Send notification to customer
        $this->notificationService->sendOrderStatusNotification($order, $newStatus);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'order' => $order->fresh(['statusLogs.changedBy'])
        ]);
    }

    /**
     * Assign AWB number to order
     */
    public function assignAwb(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'awb_number' => 'nullable|string|unique:orders,awb_number',
            'tracking_number' => 'nullable|string',
            'shipping_notes' => 'nullable|string|max:1000',
        ]);

        $awbNumber = $request->awb_number ?: $order->assignAwbNumber();

        $order->update([
            'awb_number' => $awbNumber,
            'tracking_number' => $request->tracking_number,
            'shipping_notes' => $request->shipping_notes,
        ]);

        // Log the AWB assignment
        $order->statusLogs()->create([
            'status_from' => $order->status,
            'status_to' => $order->status,
            'notes' => "AWB assigned: {$awbNumber}" . ($request->shipping_notes ? " - {$request->shipping_notes}" : ''),
            'changed_by' => auth()->id(),
            'changed_at' => now(),
            'metadata' => [
                'awb_number' => $awbNumber,
                'tracking_number' => $request->tracking_number,
            ]
        ]);

        // Send notification to customer
        $this->notificationService->sendAwbNotification($order);

        return response()->json([
            'success' => true,
            'message' => 'AWB number assigned successfully',
            'awb_number' => $awbNumber
        ]);
    }

    /**
     * Assign order to staff member
     */
    public function assignOrder(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $order->update(['assigned_to' => $request->assigned_to]);

        // Log the assignment
        $order->statusLogs()->create([
            'status_from' => $order->status,
            'status_to' => $order->status,
            'notes' => 'Order assigned to staff member',
            'changed_by' => auth()->id(),
            'changed_at' => now(),
            'metadata' => [
                'assigned_to' => $request->assigned_to,
                'assigned_to_name' => User::find($request->assigned_to)->name,
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order assigned successfully'
        ]);
    }

    /**
     * Update order priority
     */
    public function updatePriority(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'priority' => 'required|in:low,normal,high,urgent',
        ]);

        $order->update(['order_priority' => $request->priority]);

        return response()->json([
            'success' => true,
            'message' => 'Order priority updated successfully'
        ]);
    }

    /**
     * Bulk update order statuses
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $request->validate([
            'order_ids' => 'required|array',
            'order_ids.*' => 'exists:orders,id',
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);

        $orders = Order::whereIn('id', $request->order_ids)->get();
        $updatedCount = 0;

        foreach ($orders as $order) {
            $oldStatus = $order->status;
            $order->updateStatus($request->status, $request->notes, auth()->id());

            // Handle inventory
            if ($request->status === 'processing' && $oldStatus === 'pending') {
                $this->inventoryService->reserveInventory($order);
            } elseif ($request->status === 'cancelled' && in_array($oldStatus, ['pending', 'processing'])) {
                $this->inventoryService->releaseInventory($order);
            }

            // Send notification
            $this->notificationService->sendOrderStatusNotification($order, $request->status);
            $updatedCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Updated {$updatedCount} orders successfully"
        ]);
    }

    /**
     * Get order statistics for dashboard
     */
    public function getStatistics(): JsonResponse
    {
        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'shipped_orders' => Order::where('status', 'shipped')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'unpaid_orders' => Order::where('payment_status', 'unpaid')->count(),
            'today_orders' => Order::whereDate('created_at', today())->count(),
            'this_month_orders' => Order::whereMonth('created_at', now()->month)->count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
        ];

        return response()->json($stats);
    }

    /**
     * Export orders to CSV
     */
    public function export(Request $request)
    {
        // Implementation for CSV export
        // This would generate and download a CSV file with filtered orders
        return response()->json(['message' => 'Export functionality to be implemented']);
    }
}
