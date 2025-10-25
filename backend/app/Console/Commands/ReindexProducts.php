<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ProductSearch;

class ReindexProducts extends Command
{
    protected $signature = 'search:reindex';
    protected $description = 'Reconstruye el índice de búsqueda de productos';

    public function handle(ProductSearch $search): int
    {
        $this->info('Reindexando productos...');
        $search->reindexAll();
        $this->info('OK');
        return self::SUCCESS;
    }
}
