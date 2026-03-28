<!DOCTYPE html>
<html>
<head>
    <title>Refund Status Update</title>
</head>
<body>
    <h1>Refund Status Update</h1>
    <p>Hello {{ $customer->name }},</p>
    <p>The status of your refund (Reference: {{ $refund->reference }}) has been updated.</p>
    <p><strong>New Status:</strong> {{ $eventType }}</p>
    <p>{{ $message }}</p>
    <p>Thank you for shopping with us!</p>
</body>
</html>
