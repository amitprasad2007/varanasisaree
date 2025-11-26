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
use Exception;
use Laravel\Socialite\Facades\Socialite;

class VendorController  extends Controller
{

    public function index(Request $request): Response
    {
        $query = Vendor::query();
        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by verification
        if ($request->has('verified') && $request->verified !== '') {
            $query->where('is_verified', $request->verified);
        }

        // Search by name, email, or username
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $vendors = $query->withCount(['products', 'orders', 'sales'])
                        ->orderBy('created_at', 'desc')
                        ->paginate(15);

        $stats = [
            'total' => Vendor::count(),
            'pending' => Vendor::where('status', 'pending')->count(),
            'active' => Vendor::where('status', 'active')->count(),
            'suspended' => Vendor::where('status', 'suspended')->count(),
            'verified' => Vendor::where('is_verified', true)->count(),
        ];

        return Inertia::render('Admin/Vendors/Index', [
            'vendors' => $vendors,
            'stats' => $stats,
            'filters' => $request->only(['status', 'verified', 'search'])
        ]);
    }

    public function show($id) : Response
    {
        $vendor = Vendor::find($id);
        return Inertia::render('Admin/Vendors/Show', [
            'vendor' => $vendor
        ]);
    }

    public function approve($id)
    {
        $vendor = Vendor::findOrFail($id);

        // Update vendor status to active and mark as verified
        $vendor->update([
            'status' => 'active',
            'is_verified' => true
        ]);

        return redirect()->back()->with('success', 'Vendor approved successfully.');
    }

    public function suspend($id)
    {
        $vendor = Vendor::findOrFail($id);

        // Update vendor status to suspended
        $vendor->update([
            'status' => 'suspended'
        ]);

        return redirect()->back()->with('success', 'Vendor suspended successfully.');
    }

    public function activate($id)
    {
        $vendor = Vendor::findOrFail($id);

        // Update vendor status to active
        $vendor->update([
            'status' => 'active'
        ]);

        return redirect()->back()->with('success', 'Vendor activated successfully.');
    }

    public function reject($id)
    {
        $vendor = Vendor::findOrFail($id);

        // Update vendor status to rejected and unverify
        $vendor->update([
            'status' => 'inactive',
            'is_verified' => false
        ]);

        return redirect()->back()->with('success', 'Vendor rejected successfully.');
    }

    public function updateCommission(Request $request, $id)
    {
        $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:100'
        ]);

        $vendor = Vendor::findOrFail($id);
        $vendor->update([
            'commission_rate' => $request->commission_rate
        ]);

        return redirect()->back()->with('success', 'Commission rate updated successfully.');
    }

    public function updatePaymentTerms(Request $request, $id)
    {
        $request->validate([
            'payment_terms' => 'required|string|max:255'
        ]);

        $vendor = Vendor::findOrFail($id);
        $vendor->update([
            'payment_terms' => $request->payment_terms
        ]);

        return redirect()->back()->with('success', 'Payment terms updated successfully.');
    }

    public function destroy($id)
    {
        $vendor = Vendor::findOrFail($id);

        // Check if vendor has any products, orders, or sales
        if ($vendor->products()->count() > 0 || $vendor->orders()->count() > 0 || $vendor->sales()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete vendor with existing products, orders, or sales.');
        }

        $vendor->delete();

        return redirect()->route('admin.vendors.index')->with('success', 'Vendor deleted successfully.');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:approve,suspend,activate,reject,delete',
            'vendor_ids' => 'required|array',
            'vendor_ids.*' => 'exists:vendors,id'
        ]);

        $action = $request->action;
        $vendorIds = $request->vendor_ids;

        switch ($action) {
            case 'approve':
                Vendor::whereIn('id', $vendorIds)->update([
                    'status' => 'active',
                    'is_verified' => true
                ]);
                $message = 'Vendors approved successfully.';
                break;

            case 'suspend':
                Vendor::whereIn('id', $vendorIds)->update(['status' => 'suspended']);
                $message = 'Vendors suspended successfully.';
                break;

            case 'activate':
                Vendor::whereIn('id', $vendorIds)->update(['status' => 'active']);
                $message = 'Vendors activated successfully.';
                break;

            case 'reject':
                Vendor::whereIn('id', $vendorIds)->update([
                    'status' => 'inactive',
                    'is_verified' => false
                ]);
                $message = 'Vendors rejected successfully.';
                break;

            case 'delete':
                // Check if any vendor has products, orders, or sales
                $vendorsWithData = Vendor::whereIn('id', $vendorIds)
                    ->where(function ($query) {
                        $query->whereHas('products')
                              ->orWhereHas('orders')
                              ->orWhereHas('sales');
                    })->count();

                if ($vendorsWithData > 0) {
                    return redirect()->back()->with('error', 'Cannot delete vendors with existing products, orders, or sales.');
                }

                Vendor::whereIn('id', $vendorIds)->delete();
                $message = 'Vendors deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }

    public function create()
    {
       
        return Inertia::render('Admin/Vendors/Create');
    }
    public function store(Request $request)
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
                'status' => 'active',
                'is_verified' => true,
            ]);

            return redirect()->route('admin.vendors.index')
                ->with('success', 'Vendor created successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Creation failed: ' . $e->getMessage()])->withInput();
        }
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
