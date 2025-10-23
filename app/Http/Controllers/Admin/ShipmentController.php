<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class ShipmentController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Create a new shipment for an order
     */
    public function create(Order $order): Response
    {
        $order->load(['address', 'shipments']);

        return Inertia::render('Admin/Shipments/Create', [
            'order' => $order,
        ]);
    }

    /**
     * Store a new shipment
     */
    public function store(Request $request, Order $order)
    {
        $request->validate([
            'address_id' => 'required|exists:address_users,id',
            'carrier' => 'required|string|max:100',
            'service_type' => 'nullable|string|max:100',
            'awb_number' => 'nullable|string|unique:shipments,awb_number',
            'tracking_number' => 'nullable|string',
            'weight' => 'nullable|numeric|min:0',
            'dimensions_length' => 'nullable|numeric|min:0',
            'dimensions_width' => 'nullable|numeric|min:0',
            'dimensions_height' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'shipping_notes' => 'nullable|string|max:1000',
            'signature_required' => 'boolean',
        ]);

        $shipment = new Shipment();
        $awbNumber = $request->awb_number ?: $shipment->generateAwbNumber();

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'address_id' => $request->address_id,
            'awb_number' => $awbNumber,
            'tracking_number' => $request->tracking_number,
            'carrier' => $request->carrier,
            'service_type' => $request->service_type,
            'weight' => $request->weight,
            'dimensions_length' => $request->dimensions_length,
            'dimensions_width' => $request->dimensions_width,
            'dimensions_height' => $request->dimensions_height,
            'shipping_cost' => $request->shipping_cost,
            'shipping_notes' => $request->shipping_notes,
            'signature_required' => $request->signature_required ?? false,
            'status' => 'pending',
        ]);

        // Log the shipment creation
        $shipment->statusLogs()->create([
            'status_from' => null,
            'status_to' => 'pending',
            'notes' => 'Shipment created',
            'changed_at' => now(),
        ]);

        // Send notification to customer
        $this->notificationService->sendAwbNotification($order);

        return redirect()->route('admin.orders.show', $order->id)
            ->with('success', 'Shipment created successfully');
    }

    /**
     * Update shipment status
     */
    public function updateStatus(Request $request, Shipment $shipment)
    {
        $request->validate([
            'status' => 'required|in:pending,picked_up,in_transit,out_for_delivery,delivered,failed,returned',
            'notes' => 'nullable|string|max:500',
        ]);

        $shipment->updateStatus($request->status, $request->notes);

        // Send notification to customer
        $this->notificationService->sendOrderStatusNotification($shipment->order, $request->status);

        return redirect()->back()->with('success', 'Shipment status updated successfully');
    }

    /**
     * Update shipment details
     */
    public function update(Request $request, Shipment $shipment)
    {
        $request->validate([
            'tracking_number' => 'nullable|string',
            'carrier' => 'nullable|string|max:100',
            'service_type' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric|min:0',
            'dimensions_length' => 'nullable|numeric|min:0',
            'dimensions_width' => 'nullable|numeric|min:0',
            'dimensions_height' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'shipping_notes' => 'nullable|string|max:1000',
            'delivery_notes' => 'nullable|string|max:1000',
        ]);

        $shipment->update($request->only([
            'tracking_number',
            'carrier',
            'service_type',
            'weight',
            'dimensions_length',
            'dimensions_width',
            'dimensions_height',
            'shipping_cost',
            'shipping_notes',
            'delivery_notes',
        ]));

        return redirect()->back()->with('success', 'Shipment updated successfully');
    }

    /**
     * Show shipment details
     */
    public function show(Shipment $shipment): Response
    {
        $shipment->load(['order.customer', 'address', 'statusLogs']);

        return Inertia::render('Admin/Shipments/Show', [
            'shipment' => $shipment,
        ]);
    }

    /**
     * Get shipment tracking events
     */
    public function getTrackingEvents(Shipment $shipment)
    {
        // This would integrate with carrier APIs to get real-time tracking
        // For now, return the stored tracking events
        return response()->json([
            'tracking_events' => $shipment->tracking_events ?? [],
            'tracking_url' => $shipment->getTrackingUrl(),
        ]);
    }
}
