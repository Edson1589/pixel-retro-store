<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CustomerForgotPasswordRequest;
use App\Http\Requests\Auth\CustomerChangePasswordRequest;
use App\Mail\CustomerTemporaryPassword;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class CustomerPasswordController extends Controller
{
    public function forgot(CustomerForgotPasswordRequest $request)
    {
        $email = strtolower($request->input('email'));
        $user  = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'message' => 'Si el correo es válido, te enviamos una contraseña temporal.'
            ], 202);
        }

        $temp = $this->generateTempPassword(12);

        $user->password                 = $temp;
        $user->must_change_password     = true;
        $user->temp_password_expires_at = now()->addHours(24);
        $user->save();

        $front    = rtrim(config('app.frontend_url', env('FRONTEND_URL', env('APP_URL'))), '/');
        $loginUrl = $front . '/login';

        try {
            Mail::to($user->email)->send(
                new CustomerTemporaryPassword($user, $temp, $user->temp_password_expires_at, $loginUrl)
            );
        } catch (\Throwable $e) {
        }

        return response()->json([
            'message' => 'Si el correo es válido, te enviamos una contraseña temporal.'
        ]);
    }

    public function change(CustomerChangePasswordRequest $request)
    {
        $u = $request->user();

        if (!Hash::check($request->input('current_password'), $u->password)) {
            return response()->json(['message' => 'La contraseña actual no coincide.'], 422);
        }

        $u->password = $request->input('new_password');
        $u->must_change_password = false;
        $u->temp_password_expires_at = null;
        $u->save();

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    private function generateTempPassword(int $len = 12): string
    {
        $lower   = 'abcdefghjkmnpqrstuvwxyz';
        $upper   = 'ABCDEFGHJKMNPQRSTUVWXYZ';
        $digits  = '23456789';
        $symbols = '!@#$%*?';

        $pick = fn(string $s) => $s[random_int(0, strlen($s) - 1)];

        $seed = $pick($lower) . $pick($upper) . $pick($digits) . $pick($symbols);
        $pool = $lower . $upper . $digits . $symbols;

        for ($i = strlen($seed); $i < $len; $i++) $seed .= $pick($pool);

        $chars = str_split($seed);
        shuffle($chars);
        return implode('', $chars);
    }
}
