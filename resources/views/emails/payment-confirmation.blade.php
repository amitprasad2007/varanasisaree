<!DOCTYPE html>
<html>
<head>
    <title>Payment Confirmation</title>
</head>
<body>
    <h1>Payment Confirmation</h1>
    <p>Hello {{ $customer->name }},</p>
    <p>Payment of {{ $order->total_amount }} for order {{ $order->order_id }} has been confirmed.</p>
</body>
</html>
