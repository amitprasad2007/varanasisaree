<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Http\Requests\StoreCouponRequest;
use App\Http\Requests\UpdateCouponRequest;
use Inertia\Inertia;

class CouponController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $coupons = Coupon::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Coupons/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCouponRequest $request)
    {

        $data = $request->all();

        if ($request->type === 'percentage' && $request->value > 100) {
            return back()
                ->withErrors(['value' => 'Percentage value cannot exceed 100%'])
                ->withInput();
        }

        Coupon::create($data);

        return redirect()->route('coupons.index')
            ->with('message', 'Coupon created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Coupon $coupon)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Coupon $coupon)
    {
        return Inertia::render('Admin/Coupons/Edit', [
            'coupon' => $coupon
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCouponRequest $request, Coupon $coupon)
    {


        $data = $request->all();

        if ($request->type === 'percentage' && $request->value > 100) {
            return back()
                ->withErrors(['value' => 'Percentage value cannot exceed 100%'])
                ->withInput();
        }

        $coupon->update($data);

        return redirect()->route('coupons.index')
            ->with('message', 'Coupon updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return redirect()->route('coupons.index')
            ->with('message', 'Coupon deleted successfully');
    }
    public function updateStatus(Coupon $coupon)
    {
        $coupon->status = !$coupon->status;
        $coupon->save();

        return back()->with('message', 'Coupon status updated successfully');
    }

    // API endpoint to validate a coupon
    public function validate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|exists:coupons,code',
            'total' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid coupon code',
            ]);
        }

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon->status) {
            return response()->json([
                'valid' => false,
                'message' => 'This coupon is inactive',
            ]);
        }

        if ($coupon->isExpired()) {
            return response()->json([
                'valid' => false,
                'message' => 'This coupon has expired',
            ]);
        }

        if ($coupon->isUsageLimitReached()) {
            return response()->json([
                'valid' => false,
                'message' => 'This coupon has reached its usage limit',
            ]);
        }

        if ($coupon->min_spend && $request->total < $coupon->min_spend) {
            return response()->json([
                'valid' => false,
                'message' => "Minimum spend of $" . number_format($coupon->min_spend, 2) . " required",
            ]);
        }

        $discount = $coupon->type === 'fixed' ? $coupon->value : ($request->total * $coupon->value / 100);

        if ($coupon->max_discount && $discount > $coupon->max_discount) {
            $discount = $coupon->max_discount;
        }

        return response()->json([
            'valid' => true,
            'discount' => round($discount, 2),
            'message' => 'Coupon applied successfully',
            'coupon' => $coupon,
        ]);
    }
}
