<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DescriptorEngine;

class ReindexProductDescriptors extends Command
{
    protected $signature = 'descriptors:reindex-products';
    protected $description = 'Reconstruye los descriptores de productos';

    public function handle(DescriptorEngine $engine): int
    {
        $this->info('Indexando descriptores...');
        $engine->reindexAll();
        $this->info('OK');
        return self::SUCCESS;
    }
}
