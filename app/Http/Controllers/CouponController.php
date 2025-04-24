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


}
