<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function userlogin(Request $request)
    {
        $user = User::where('mobile', $request->mobile)->first();
        if (!$user) {
            return response()->json(['message' => 'Invalid Mobile or Password'], 401);
        } else {
            if ($request->password) {
                if (Hash::check($request->password, $user->password)) {
                    $token = $user->createToken('authToken')->plainTextToken;
                    return response()->json(['token' => $token,'user'=>$user]);
                } else {
                    return response()->json(['message' => 'Invalid email or password'], 401);
                }
            }
            return response()->json(['message' => 'please send password'], 200);
        }
    }
}
