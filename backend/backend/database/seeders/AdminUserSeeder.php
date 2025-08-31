<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@pixelretro.dev'],
            [
                'name' => 'Admin PixelRetro',
                'password' => Hash::make('Admin123!'), // cámbiala luego
                'role' => 'admin',
                'is_admin' => true,
            ]
        );
    }
}
