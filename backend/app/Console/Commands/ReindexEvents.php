<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\EventSearch;

class ReindexEvents extends Command
{
    protected $signature = 'search:reindex-events';
    protected $description = 'Reconstruye el índice de búsqueda de eventos';

    public function handle(EventSearch $search): int
    {
        $this->info('Reindexando eventos publicados...');
        $search->reindexAll();
        $this->info('OK');
        return self::SUCCESS;
    }
}
