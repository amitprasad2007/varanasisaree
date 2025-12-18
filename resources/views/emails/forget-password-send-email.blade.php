<!DOCTYPE html>
<html>
<head>
    <title>Password Reset Link</title>
</head>

<body>
    <h2>Hello, {{ Illuminate\Support\Str::title($data['data']['name'] ?? 'Customer') }}!</h2>
    <p>We received a request to reset the password for your account. If you made this request, please click the link below to reset your password:</p>
    <a href="{{ rtrim(env('FRONTEND_URL'), '/') }}/reset-password?token={{ urlencode($data['data']['token']) }}&email={{ urlencode($data['data']['email']) }}">Reset Password</a>
    <p>This link will expire shortly for your security.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you!</p>
    <p>Best regards,</p>
    <p>Samar Silk Palace</p>
    <p>Varanasi, Uttar Pradesh, India</p>    
</body>
</html>