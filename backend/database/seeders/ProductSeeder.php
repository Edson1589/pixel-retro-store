<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['Consola NES (Original)', 1200, 2, 'used', true],
            ['Super Nintendo SNES', 1500, 1, 'used', true],
            ['Cartucho Mario Bros (NES)', 200, 10, 'used', false],
            ['Control SNES original', 180, 8, 'used', false],
            ['Figura Link 8-bit', 250, 5, 'new', false],
        ];

        foreach ($rows as [$name, $price, $stock, $condition, $unique]) {
            $slug = Str::slug($name);
            $catSlug = str_contains(Str::lower($name), 'cartucho') ? 'juegos'
                : (str_contains(Str::lower($name), 'control') ? 'accesorios'
                    : (str_contains(Str::lower($name), 'figura') ? 'coleccionables' : 'consolas'));

            $category = Category::where('slug', $catSlug)->first();

            Product::firstOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $category?->id,
                    'name' => $name,
                    'sku' => Str::upper(Str::random(8)),
                    'description' => 'Artículo retro para coleccionistas.',
                    'price' => $price,
                    'stock' => $stock,
                    'condition' => $condition,
                    'is_unique' => $unique,
                    'status' => 'active',
                ]
            );
        }
    }
}
