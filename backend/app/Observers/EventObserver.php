<?php

namespace App\Observers;

use App\Models\Event;

class EventObserver
{
    public function saved(Event $event): void
    {
        if (class_exists(\App\Services\EventSearch::class)) {
            app(\App\Services\EventSearch::class)->indexEvent($event);
        }
        app(\App\Services\EventDescriptorEngine::class)->indexEvent($event);
    }

    public function deleted(Event $event): void
    {
        if (class_exists(\App\Services\EventSearch::class)) {
            app(\App\Services\EventSearch::class)->removeEvent($event);
        }
    }
}
