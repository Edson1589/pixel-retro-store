<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CustomerLoginRequest;
use App\Http\Requests\Auth\CustomerRegisterRequest;
use App\Mail\TemporaryPasswordMail;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class CustomerAuthController extends Controller
{
    /**
     * Registro de nuevos clientes
     */
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
            'force_password_change' => false, // 🔹 por defecto no requiere cambio
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

    /**
     * Login de clientes
     */
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

    /**
     * Enviar contraseña temporal (Olvidé mi contraseña)
     */
    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return response()->json([
                'message' => 'No existe un usuario con ese correo.'
            ], 404);
        }

        // 🔹 Generar una contraseña temporal aleatoria
        $tempPassword = Str::random(10);

        // 🔹 Actualizar al usuario y forzar cambio
        $user->update([
            'password' => Hash::make($tempPassword),
            'force_password_change' => true, // ✅ activa el cambio obligatorio
        ]);

        // 🔹 Enviar el correo
        Mail::to($user->email)->send(new TemporaryPasswordMail($tempPassword));

        return response()->json([
            'message' => 'Se envió una contraseña temporal a tu correo.',
        ], 200);
    }

    /**
     * Cambiar contraseña después de iniciar sesión con temporal
     */
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

    /**
     * Obtener datos del usuario autenticado
     */
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

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Sesión cerrada']);
    }
}
