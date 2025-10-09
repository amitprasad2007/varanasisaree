<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserLogController extends Controller
{
    // Attach a guest session token's logs to the authenticated user
    public function attachSession(Request $request)
    {
        $customer = $request->user();
        $validated = $request->validate([
            'session_token' => ['required', 'string', 'max:64'],
        ]);

        DB::table('user_logs')
            ->where('session_token', $validated['session_token'])
            ->whereNull('user_id')
            ->update([
                'user_id' => $customer->id,
                'updated_at' => now(),
            ]);

        return response()->json(['status' => 'ok']);
    }
}


