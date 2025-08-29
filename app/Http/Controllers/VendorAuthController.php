<?php

namespace App\Http\Controllers;


use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class VendorAuthController extends Controller
{
    public function showRegistrationForm(): Response
    {
        return Inertia::render('Vendor/Auth/Register');
    }

    public function showLoginForm(): Response
    {
        return Inertia::render('Vendor/Auth/Login');
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:50|unique:vendors|alpha_dash',
            'business_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:vendors',
            'phone' => 'required|string|max:20|unique:vendors',
            'password' => 'required|string|min:8|confirmed',
            'description' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'gstin' => 'nullable|string|max:15|unique:vendors',
            'pan' => 'nullable|string|max:10|unique:vendors',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Generate subdomain from username
        $subdomain = $this->generateUniqueSubdomain($request->username);

        try {
            $vendor = Vendor::create([
                'username' => $request->username,
                'business_name' => $request->business_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'description' => $request->description,
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country,
                'postal_code' => $request->postal_code,
                'gstin' => $request->gstin,
                'pan' => $request->pan,
                'contact_person' => $request->contact_person,
                'contact_email' => $request->contact_email,
                'contact_phone' => $request->contact_phone,
                'subdomain' => $subdomain,
                'status' => 'pending',
                'is_verified' => false,
            ]);

            return redirect()->route('vendor.register')
                ->with('success', 'Vendor registered successfully. Please wait for admin approval.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Registration failed: ' . $e->getMessage()])->withInput();
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $credentials = $request->only('email', 'password');

        if (Auth::guard('vendor')->attempt($credentials)) {
            $vendor = Auth::guard('vendor')->user();

            if ($vendor->status !== 'active') {
                Auth::guard('vendor')->logout();
                return back()->withErrors([
                    'email' => 'Account is not active. Please contact admin for approval.'
                ])->withInput();
            }

            if (!$vendor->is_verified) {
                Auth::guard('vendor')->logout();
                return back()->withErrors([
                    'email' => 'Account is not verified. Please contact admin.'
                ])->withInput();
            }

            // Update last login
            $vendor->update(['last_login_at' => now()]);

            $request->session()->regenerate();

            return redirect()->intended(route('vendor.dashboard'))
                ->with('success', 'Login successful');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->withInput();
    }

    public function profile(Request $request): Response
    {
        $vendor = Auth::guard('vendor')->user();

        return Inertia::render('Vendor/Profile', [
            'vendor' => $vendor->load(['products', 'orders', 'sales']),
            'subdomain_url' => $vendor->subdomain_url,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $vendor = Auth::guard('vendor')->user();

        $validator = Validator::make($request->all(), [
            'business_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'gstin' => 'nullable|string|max:15|unique:vendors,gstin,' . $vendor->id,
            'pan' => 'nullable|string|max:10|unique:vendors,pan,' . $vendor->id,
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'logo' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $vendor->update($request->only([
            'business_name', 'description', 'address', 'city', 'state',
            'country', 'postal_code', 'gstin', 'pan', 'contact_person',
            'contact_email', 'contact_phone', 'logo'
        ]));

        return back()->with('success', 'Profile updated successfully');
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $vendor = Auth::guard('vendor')->user();

        if (!Hash::check($request->current_password, $vendor->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect']);
        }

        $vendor->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password changed successfully');
    }

    public function logout(Request $request)
    {
        Auth::guard('vendor')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('vendor.login')
            ->with('success', 'Logged out successfully');
    }

    public function checkSubdomain(Request $request, $domain)
    {
        $exists = Vendor::where('subdomain', $domain)->exists();
        return response()->json([
            'available' => !$exists,
            'subdomain' => $request->domain,
        ]);
    }

    private function generateUniqueSubdomain(string $username): string
    {
        $baseSubdomain = Str::slug($username);
        $subdomain = $baseSubdomain;
        $counter = 1;

        while (Vendor::where('subdomain', $subdomain)->exists()) {
            $subdomain = $baseSubdomain . '-' . $counter;
            $counter++;
        }

        return $subdomain;
    }
}
