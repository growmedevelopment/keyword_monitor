<?php

namespace App\Http\Controllers;

use AllowDynamicProperties;
use App\Models\User;
use App\Services\DataForSeo\AccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller {

    protected AccountService $accountService;

    public function __construct(AccountService $accountService) {
        $this->accountService = $accountService;
    }

    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|confirmed',
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
        ]);

        $token = $user->createToken('myapptoken')->plainTextToken;

        Auth::login($user);

        return response([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response([
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request): JsonResponse {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function getAPIUserData(): JsonResponse {

        $api_user = $this->accountService::getAccountDetails();

        return response()->json($api_user);
    }
}
