<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
        .order-details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-{{ $newStatus }} {
            background-color: @if($newStatus === 'shipped') #28a745 @elseif($newStatus === 'delivered') #007bff @elseif($newStatus === 'cancelled') #dc3545 @else #ffc107 @endif;
            color: white;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Varanasi Saree</h1>
        <h2>Order Status Update</h2>
    </div>

    <div class="content">
        <p>Dear {{ $customer->name }},</p>
        
        <p>{{ $message }}</p>

        <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> {{ $order->order_id }}</p>
            <p><strong>Order Date:</strong> {{ $order->created_at->format('M d, Y') }}</p>
            <p><strong>Total Amount:</strong> ₹{{ number_format($order->total_amount, 2) }}</p>
            <p><strong>Status:</strong> 
                <span class="status-badge status-{{ $newStatus }}">
                    {{ ucfirst($newStatus) }}
                </span>
            </p>
        </div>

        @if($order->awb_number)
        <div class="order-details">
            <h3>Shipping Information</h3>
            <p><strong>AWB Number:</strong> {{ $order->awb_number }}</p>
            @if($order->tracking_number)
            <p><strong>Tracking Number:</strong> {{ $order->tracking_number }}</p>
            @endif
        </div>
        @endif

        <p>Thank you for choosing Varanasi Saree. If you have any questions, please don't hesitate to contact us.</p>

        <p>Best regards,<br>
        Varanasi Saree Team</p>
    </div>

    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} Varanasi Saree. All rights reserved.</p>
    </div>
</body>
</html>
