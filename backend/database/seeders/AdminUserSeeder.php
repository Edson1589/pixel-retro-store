<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Administrador Pixel Retro',
                'email'    => 'admin@pixelretrostore.test',
                'role'     => 'admin',
                'password' => 'Admin123*',
                'must_change_password' => true,
            ],
            [
                'name'     => 'Vendedor Demo',
                'email'    => 'vendedor01@pixelretrostore.test',
                'role'     => 'seller',
                'password' => 'Vendedor123*',
                'must_change_password' => true,
            ],
            [
                'name'     => 'Técnico Demo',
                'email'    => 'tecnico01@pixelretrostore.test',
                'role'     => 'technician',
                'password' => 'Tecnico123*',
                'must_change_password' => true,
            ],
            [
                'name'     => 'Cliente Demo',
                'email'    => 'cliente.demo@pixelretrostore.test',
                'role'     => 'customer',
                'password' => 'Cliente123*',
                'must_change_password' => false,
            ],
        ];

        foreach ($users as $data) {
            User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'                => $data['name'],
                    'role'                => $data['role'],
                    'password'            => Hash::make($data['password']),
                    'must_change_password' => $data['must_change_password'],
                    'email_verified_at'   => now(),
                ]
            );
        }
    }
}
