<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ForgetPasswordSendEmail;
use App\Models\Customer;
use App\Services\CustomerService;
use Carbon\Carbon;
use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

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
        $customer = $request->user()->load(['orders.cartItems', 'wishlists.product', 'addresses', 'cartItems.product', 'cartItems.productVariant']);

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
                $customer = Customer::where('google_id', $socialUser->getId())->first();
            } elseif ($provider === 'facebook') {
                $customer = Customer::where('facebook_id', $socialUser->getId())->first();
            }

            // If customer doesn't exist, create new one
            if (! $customer) {
                $customerData = [
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'avatar' => $socialUser->getAvatar(),
                ];

                // Add provider-specific ID
                if ($provider === 'google') {
                    $customerData['google_id'] = $socialUser->getId();
                } elseif ($provider === 'facebook') {
                    $customerData['facebook_id'] = $socialUser->getId();
                }

                $customer = Customer::create($customerData);
            }

            $token = $customer->createToken('customerAuthToken', ['customer'])->plainTextToken;

            // Determine redirect URL based on provider
            if (str_ends_with($provider, 'Mobile')) {
                $baseUrl = config('app.mobile_frontend_url', 'appfashion://oauth/callback');
            } else {
                $baseUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/').'/oauth/callback';
            }

            // Construct full URL with query parameters
            $redirectUrl = $baseUrl.(str_contains($baseUrl, '?') ? '&' : '?').'token='.$token.'&provider='.$provider;

            return redirect($redirectUrl);

        } catch (\Exception $e) {
            Log::error($provider.' OAuth Error: '.$e->getMessage());

            if (str_ends_with($provider, 'Mobile')) {
                $baseUrl = config('app.mobile_frontend_url', 'appfashion://oauth/callback');
            } else {
                $baseUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/').'/oauth/callback';
            }

            $redirectUrl = $baseUrl.(str_contains($baseUrl, '?') ? '&' : '?').'error=oauth_failed';

            return redirect($redirectUrl);
        }
    }

    public function handleTokenCallback(Request $request, $provider)
    {
        try {
            $request->validate([
                'token' => 'required|string',
            ]);

            // Retrieve user details from the provider using the token provided by React Native SDK
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver($provider);
            $socialUser = $driver->userFromToken($request->token);

            $customer = null;
            if ($provider === 'googleMobile') {
                $customer = Customer::where('google_id', $socialUser->getId())->orWhere('email', $socialUser->getEmail())->first();
            } elseif ($provider === 'facebookMobile') {
                $customer = Customer::where('facebook_id', $socialUser->getId())->orWhere('email', $socialUser->getEmail())->first();
            }

            // Create new customer if not exists
            if (! $customer) {
                $customerData = [
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'avatar' => $socialUser->getAvatar(),
                ];

                if ($provider === 'googleMobile') {
                    $customerData['google_id'] = $socialUser->getId();
                } elseif ($provider === 'facebookMobile') {
                    $customerData['facebook_id'] = $socialUser->getId();
                }

                $customer = Customer::create($customerData);
            } else {
                // Update provider ID if it was matched by email only
                if ($provider === 'googleMobile' && ! $customer->google_id) {
                    $customer->google_id = $socialUser->getId();
                    $customer->save();
                } elseif ($provider === 'facebookMobile' && ! $customer->facebook_id) {
                    $customer->facebook_id = $socialUser->getId();
                    $customer->save();
                }
            }

            $token = $customer->createToken('customerAuthToken', ['customer'])->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'OAuth login successful',
                'customer' => $customer,
                'token' => $token,
            ]);

        } catch (\Exception $e) {
            Log::error($provider.' Native Token OAuth Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'OAuth authentication failed. Invalid token.',
            ], 401);
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

        if (! $customer) {
            // Avoid leaking whether the email exists; return success message
            return response()->json(['status' => true]);
        }

        // Create a reset token using the customers broker
        /** @var PasswordBroker $broker */
        $broker = Password::broker('customers');
        $token = $broker->getRepository()->create($customer);

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

    public function changetokencheck(Request $request)
    {
        // Require both email and token to validate
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        $record = DB::table('customer_password_reset_tokens')->where('email', $request->email)->first();
        if (! $record) {
            return response()->json(['status' => false]);
        }
        $isValid = Hash::check($request->token, $record->token);

        // Check expiry
        $expires = config('auth.passwords.customers.expire', 60);
        $notExpired = $record->created_at && now()->diffInMinutes(Carbon::parse($record->created_at)) <= $expires;

        return response()->json(['status' => $isValid && $notExpired]);
    }

    public function changepassword(Request $request)
    {
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
