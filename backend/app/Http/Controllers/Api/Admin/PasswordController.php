<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ChangePasswordRequest;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Admin\ForgotPasswordRequest;
use App\Mail\AdminTemporaryPassword;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class PasswordController extends Controller
{
    public function change(ChangePasswordRequest $request)
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

    public function forgot(ForgotPasswordRequest $request)
    {
        $email = strtolower($request->input('email'));
        $user  = User::whereRaw('LOWER(email) = ?', [$email])->first();

        $allowed = ['admin', 'seller', 'technician'];

        if (!$user || !in_array($user->role, $allowed, true)) {
            return response()->json([
                'message' => 'Si el correo es válido, te enviaremos una contraseña temporal.'
            ], 202);
        }

        $temp = $this->generateTempPassword(12);

        $user->password                 = $temp;
        $user->must_change_password     = true;
        $user->temp_password_expires_at = now()->addHours(24);
        $user->save();

        $front    = rtrim(config('app.frontend_url', env('FRONTEND_URL', env('APP_URL'))), '/');
        $loginUrl = $front . '/admin/login';

        try {
            Mail::to($user->email)->send(
                new AdminTemporaryPassword($user, $temp, $user->temp_password_expires_at, $loginUrl)
            );
        } catch (\Throwable $e) {
        }

        return response()->json([
            'message' => 'Si el correo es válido, te enviamos una contraseña temporal.'
        ]);
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
