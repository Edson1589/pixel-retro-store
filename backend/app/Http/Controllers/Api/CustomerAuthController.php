<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CustomerLoginRequest;
use App\Http\Requests\Auth\CustomerRegisterRequest;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\TemporaryPasswordMail;

class CustomerAuthController extends Controller
{
    public function register(CustomerRegisterRequest $request)
    {
        $data = $request->validated();

        if (User::where('email', $data['email'])->exists()) {
            return response()->json([
                'message' => 'El usuario ya está registrado.'
            ], 422);
        }

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'role'     => 'customer',
        ]);

        Customer::updateOrCreate(
            ['email' => $data['email']],
            [
                'name'    => $data['name'],
                'phone'   => $data['phone']    ?? null,
                'address' => $data['address']  ?? null,
            ]
        );

        $token = $user->createToken('customer')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ]
        ], 201);
    }

    public function login(CustomerLoginRequest $request)
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Rol no permitido en este endpoint'], 403);
        }

        $token = $user->createToken('customer')->plainTextToken;

        // 🔹 Si el usuario tiene marcada la bandera de cambio obligatorio
        if ($user->force_password_change) {
            return response()->json([
                'requires_password_change' => true,
                'message' => 'Debes cambiar tu contraseña antes de continuar.',
                'token' => $token,
            ]);
        }

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ]
        ]);
    }

    public function me(Request $request)
    {
        $u = $request->user();
        return response()->json([
            'id'    => $u->id,
            'name'  => $u->name,
            'email' => $u->email,
            'role'  => $u->role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[a-z]/',      // al menos una minúscula
                'regex:/[A-Z]/',      // al menos una mayúscula
                'regex:/[0-9]/',      // al menos un número
                'regex:/[@$!%*?&]/'   // al menos un símbolo
            ],
            'password_confirmation' => ['required', 'same:password'],
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($data['password']),
            'force_password_change' => false, // 🔹 ya no necesita cambiarla
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }

    // ✅ Método que faltaba
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'No existe una cuenta con ese correo.'], 404);
        }

        $tempPassword = Str::random(8) . '@A';

        $user->update([
            'password' => Hash::make($tempPassword),
            'force_password_change' => true,
        ]);

        try {
            Mail::to($user->email)->send(new TemporaryPasswordMail($tempPassword));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error enviando correo.',
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json(['message' => 'Se envió una contraseña temporal a tu correo.']);
    }
}
