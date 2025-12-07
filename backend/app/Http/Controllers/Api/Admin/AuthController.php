<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string']
        ]);

        $u = User::where('email', $data['email'])->first();

        if (!$u || !Hash::check($data['password'], $u->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        if (!in_array($u->role, ['admin', 'seller', 'technician'], true)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $token = $u->createToken('admin')->plainTextToken;
        $u->last_login_at = now();
        $u->save();

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'must_change_password' => (bool)$u->must_change_password,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }
}
