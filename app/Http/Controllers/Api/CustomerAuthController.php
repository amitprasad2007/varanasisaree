<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Services\CustomerService;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ForgetPasswordSendEmail;

class CustomerAuthController extends Controller
{
    protected $customerService;

    public function __construct(CustomerService $customerService)
    {
        $this->customerService = $customerService;
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:customers',
            'phone' => 'nullable|string|max:20|unique:customers,phone',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        $token = $customer->createToken('customerAuthToken', ['customer'])->plainTextToken;

        return response()->json([
            'message' => 'Customer registered successfully',
            'customer' => $customer,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer = Customer::where('email', $request->email)->first();

        if (! $customer || ! Hash::check($request->password, $customer->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $customer->createToken('customerAuthToken', ['customer'])->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'customer' => $customer,
            'token' => $token,
        ]);
    }

    public function profile(Request $request)
    {
        $customer = $request->user()->load(['orders.cartItems', 'wishlists.product', 'addresses', 'cartItems.product','cartItems.productVariant']);
        return response()->json($this->customerService->formatCustomerData($customer));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function redirectToGoogle($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function handleGoogleCallback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();

            // Check if user exists by provider-specific ID
            $customer = null;
            if ($provider === 'google') {
                $customer = Customer::where('google_id', $socialUser->id)->first();
            } elseif ($provider === 'facebook') {
                $customer = Customer::where('facebook_id', $socialUser->id)->first();
            }

            // If customer doesn't exist, create new one
            if (!$customer) {
                $customerData = [
                    'name' => $socialUser->name,
                    'email' => $socialUser->email,
                    'avatar' => $socialUser->avatar,
                ];

                // Add provider-specific ID
                if ($provider === 'google') {
                    $customerData['google_id'] = $socialUser->id;
                } elseif ($provider === 'facebook') {
                    $customerData['facebook_id'] = $socialUser->id;
                }

                $customer = Customer::create($customerData);
            }

            $token = $customer->createToken('customerAuthToken', ['customer'])->plainTextToken;

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL');
            return redirect($frontendUrl . 'oauth/callback?token=' . $token . '&provider=' . $provider);

        } catch (\Exception $e) {
            Log::error($provider . ' OAuth Error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL');
            return redirect($frontendUrl . 'oauth/callback?error=oauth_failed');
        }
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer = Customer::where('email', $request->email)->first();

        if (!$customer) {
            // Avoid leaking whether the email exists; return success message
            return response()->json(['status' => true]);
        }

        // Create a reset token using the customers broker
        $token = Password::broker('customers')->getRepository()->create($customer);

        // Send email with token and email for frontend to use
        Mail::to($customer->email)->send(new ForgetPasswordSendEmail([
            'subject' => 'Password Reset Link',
            'data' => [
                'name' => $customer->name,
                'email' => $customer->email,
                'token' => $token,
            ],
        ]));

        return response()->json(['status' => true]);
    }

    public function changetokencheck (Request $request){
        // Require both email and token to validate
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        $record = DB::table('customer_password_reset_tokens')->where('email', $request->email)->first();
        if (!$record) {
            return response()->json(['status' => false]);
        }
        $isValid = \Illuminate\Support\Facades\Hash::check($request->token, $record->token);

        // Check expiry
        $expires = config('auth.passwords.customers.expire', 60);
        $notExpired = $record->created_at && now()->diffInMinutes(\Carbon\Carbon::parse($record->created_at)) <= $expires;

        return response()->json(['status' => $isValid && $notExpired]);
    }

    public function changepassword (Request $request){
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        $status = Password::broker('customers')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($customer) use ($request) {
                $customer->password = Hash::make($request->password);
                $customer->setRememberToken(Str::random(60));
                $customer->save();
            }
        );

        return response()->json(['status' => $status === Password::PASSWORD_RESET]);
    }

}


