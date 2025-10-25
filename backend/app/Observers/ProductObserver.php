<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\ProductSearch;
use App\Services\DescriptorEngine;

class ProductObserver
{
    public function saved(Product $product): void
    {
        app(ProductSearch::class)->indexProduct($product);
        app(DescriptorEngine::class)->indexProduct($product);
    }

    public function deleted(Product $product): void
    {
        app(ProductSearch::class)->removeProduct($product);
    }
}
