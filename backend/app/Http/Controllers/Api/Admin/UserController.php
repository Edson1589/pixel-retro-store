<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Mail\Admin\NewUserTemporaryCredentials;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $per = max(1, min(100, (int) $request->integer('per_page', 20)));
        $q = User::query()->whereIn('role', ['admin', 'seller', 'technician']);

        if ($s = trim((string)$request->string('search'))) {
            $q->where(function ($qq) use ($s) {
                $qq->where('name', 'like', "%$s%")
                    ->orWhere('email', 'like', "%$s%")
                    ->orWhere('role', 'like', "%$s%");
            });
        }

        return response()->json($q->orderBy('name')->paginate($per));
    }

    public function show(int $id)
    {
        $u = User::findOrFail($id);
        if (!in_array($u->role, ['admin', 'seller', 'technician'], true)) {
            abort(404);
        }
        return response()->json($u);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        $temp = str()->password(12);
        $expiresAt = now()->addHours((int)($data['temp_expires_in_hours'] ?? 24));

        $u = User::create([
            'name'  => $data['name'],
            'email' => $data['email'],
            'role'  => $data['role'],
            'password' => Hash::make($temp),
            'must_change_password' => true,
            'temp_password_expires_at' => $expiresAt,
            'created_by_admin_id' => $request->user()->id,
        ]);

        try {
            Mail::to($u->email)->send(new NewUserTemporaryCredentials($u, $temp));
        } catch (\Throwable $th) {
        }

        return response()->json($u, 201);
    }

    public function update(UpdateUserRequest $request, int $id)
    {
        $u = User::findOrFail($id);
        $auth = $request->user();
        $data = $request->validated();

        if (isset($data['role']) && $u->id === $auth->id && $u->role === 'admin' && $data['role'] !== 'admin') {
            return response()->json(['message' => 'No puedes quitarte tu rol de admin.'], 422);
        }

        $u->fill($data)->save();
        return response()->json($u);
    }

    public function destroy(Request $request, int $id)
    {
        $auth = $request->user();
        $u = User::findOrFail($id);

        if ($u->id === $auth->id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 422);
        }

        if ($u->role === 'admin') {
            $admins = User::where('role', 'admin')->where('id', '!=', $u->id)->count();
            if ($admins === 0) {
                return response()->json(['message' => 'No puedes eliminar al último admin.'], 422);
            }
        }

        $u->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
