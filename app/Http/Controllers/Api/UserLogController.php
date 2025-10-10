<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserLogController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'event' => ['required', 'string', 'max:64'],
            'session_token' => ['nullable', 'string', 'max:64'],
            'meta' => ['nullable', 'array'],
        ]);

        DB::table('user_logs')->insert([
            'user_id' => $user?->id,
            'session_token' => $validated['session_token'] ?? $request->header('X-Session-Token'),
            'event' => $validated['event'],
            'meta' => empty($validated['meta']) ? null : json_encode($validated['meta']),
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['status' => 'ok']);
    }
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


