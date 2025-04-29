<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AddressUser;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    /**
     * List all addresses for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $addresses = AddressUser::where('user_id', $user->id)->get();

        return response()->json([
            'addresses' => $addresses
        ]);
    }

    /**
     * Store a new address
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // If this is the first address or is_default is true, set it as default
        $isDefault = $request->is_default ?? false;

        // If this is the first address, make it default
        $addressCount = AddressUser::where('user_id', $user->id)->count();
        if ($addressCount === 0) {
            $isDefault = true;
        }

        // If this address is set as default, unset other default addresses
        if ($isDefault) {
            AddressUser::where('user_id', $user->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $address = AddressUser::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'phone' => $request->phone,
            'address_line1' => $request->address_line1,
            'address_line2' => $request->address_line2,
            'city' => $request->city,
            'state' => $request->state,
            'country' => $request->country,
            'postal_code' => $request->postal_code,
            'is_default' => $isDefault,
        ]);

        return response()->json([
            'message' => 'Address added successfully',
            'address' => $address
        ], 201);
    }

    /**
     * Update an existing address
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $address = AddressUser::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // If this address is set as default, unset other default addresses
        if ($request->is_default) {
            AddressUser::where('user_id', $user->id)
                ->where('id', '!=', $id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $address->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'address_line1' => $request->address_line1,
            'address_line2' => $request->address_line2,
            'city' => $request->city,
            'state' => $request->state,
            'country' => $request->country,
            'postal_code' => $request->postal_code,
            'is_default' => $request->is_default ?? $address->is_default,
        ]);

        return response()->json([
            'message' => 'Address updated successfully',
            'address' => $address
        ]);
    }

    /**
     * Delete an address
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $address = AddressUser::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $address->delete();

        return response()->json([
            'message' => 'Address deleted successfully'
        ]);
    }
}
