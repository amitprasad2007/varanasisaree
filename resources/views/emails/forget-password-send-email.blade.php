<!DOCTYPE html>
<html>
<head>
    <title>Password Reset Link</title>
</head>

<body>
    <h2>Hello, {{ $data['data']->name }}!</h2>
    <p>We received a request to reset the password for your account. If you made this request, please click the link below to reset your password:</p>
    <a href="{{ $data['data']->remember_token }}">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you!</p>
    <p>Best regards,</p>
    <p>Samar Silk Palace</p>
    <p>Varanasi, Uttar Pradesh, India</p>    
</body>
</html>