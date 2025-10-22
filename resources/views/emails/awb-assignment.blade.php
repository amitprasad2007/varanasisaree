<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your Order Has Been Shipped!</title>
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
            background-color: #28a745;
            color: white;
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
        .shipping-info {
            background-color: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .awb-number {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            margin: 10px 0;
        }
        .tracking-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 0;
        }
        .order-details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
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
        <h1>🚚 Your Order Has Been Shipped!</h1>
        <p>Great news! Your order is on its way to you.</p>
    </div>

    <div class="content">
        <p>Dear {{ $customer->name }},</p>
        
        <p>We're excited to let you know that your order has been shipped and is now on its way to you!</p>

        <div class="shipping-info">
            <h3>📦 Shipping Information</h3>
            <p><strong>AWB Number:</strong></p>
            <div class="awb-number">{{ $order->awb_number }}</div>
            
            @if($order->tracking_number)
            <p><strong>Tracking Number:</strong> {{ $order->tracking_number }}</p>
            @endif
            
            <a href="#" class="tracking-button">Track Your Package</a>
        </div>

        <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> {{ $order->order_id }}</p>
            <p><strong>Order Date:</strong> {{ $order->created_at->format('M d, Y') }}</p>
            <p><strong>Total Amount:</strong> ₹{{ number_format($order->total_amount, 2) }}</p>
            <p><strong>Shipping Address:</strong></p>
            @if($order->address)
            <p>
                {{ $order->address->address_line_1 }}<br>
                @if($order->address->address_line_2){{ $order->address->address_line_2 }}<br>@endif
                {{ $order->address->city }}, {{ $order->address->state }} {{ $order->address->pincode }}<br>
                {{ $order->address->country }}
            </p>
            @endif
        </div>

        <p><strong>What's Next?</strong></p>
        <ul>
            <li>You can track your package using the AWB number above</li>
            <li>Expected delivery time: 3-7 business days</li>
            <li>You'll receive another notification when your package is delivered</li>
        </ul>

        <p>Thank you for choosing Varanasi Saree. We hope you love your purchase!</p>

        <p>Best regards,<br>
        Varanasi Saree Team</p>
    </div>

    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} Varanasi Saree. All rights reserved.</p>
    </div>
</body>
</html>
