<?php

use Illuminate\Database\Seeder;
use App\Models\Product;

class ServiceProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::updateOrCreate(
            ['slug' => 'servicios1'],
            [
                'name'       => 'Servicios',
                'sku'        => 'SERV-001',
                'description' => 'Mano de obra / servicios técnicos',
                'price'      => 0,
                'stock'      => 0,
                'condition'  => 'new',
                'is_unique'  => false,
                'image_url'  => null,
                'status'     => 'active',
                'is_service' => true,
            ]
        );
    }
}
