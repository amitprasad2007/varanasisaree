<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Coupon;

class CouponController extends Controller
{
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
