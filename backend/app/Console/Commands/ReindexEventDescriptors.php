<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\EventDescriptorEngine;

class ReindexEventDescriptors extends Command
{
    protected $signature = 'descriptors:reindex-events';
    protected $description = 'Reconstruye los descriptores de eventos';

    public function handle(EventDescriptorEngine $engine): int
    {
        $this->info('Indexando descriptores de eventos...');
        $engine->reindexAll();
        $this->info('OK');
        return self::SUCCESS;
    }
}
