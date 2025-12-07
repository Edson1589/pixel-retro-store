<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'title' => 'Torneo Super Mario Bros (NES)',
                'type' => 'tournament',
                'description' => 'Formato 1v1, bracket simple. Premios retro.',
                'location' => 'Pixel Retro Store - Sala 1',
                'start_at' => Carbon::now()->addDays(10)->setTime(15, 0),
                'end_at' => Carbon::now()->addDays(10)->setTime(18, 0),
                'capacity' => 16,
                'status' => 'published',
                'registration_open_at' => Carbon::now()->subDay(),
                'registration_close_at' => Carbon::now()->addDays(9)->setTime(23, 59),
            ],
            [
                'title' => 'Meetup Cultura Retro + Trueque',
                'type' => 'event',
                'description' => 'Charla, intercambio de cartuchos y showcase.',
                'location' => 'Pixel Retro Store - Patio',
                'start_at' => Carbon::now()->addDays(20)->setTime(17, 0),
                'end_at' => Carbon::now()->addDays(20)->setTime(20, 0),
                'capacity' => null,
                'status' => 'published',
                'registration_open_at' => Carbon::now()->subDay(),
                'registration_close_at' => Carbon::now()->addDays(19)->setTime(23, 59),
            ],
        ];

        foreach ($items as $it) {
            $it['slug'] = Str::slug($it['title']);
            Event::updateOrCreate(['slug' => $it['slug']], $it);
        }
    }
}
