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

}
