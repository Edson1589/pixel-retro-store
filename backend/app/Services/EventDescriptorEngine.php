<?php

namespace App\Services;

use App\Models\Event;
use App\Support\Search\Tokenizer;
use Illuminate\Support\Facades\DB;

class EventDescriptorEngine
{
    public function indexEvent(Event $e): void
    {
        $map = config('descriptors_events', []);

        $titleTerms = Tokenizer::terms($e->title ?? '');
        $locTerms   = Tokenizer::terms($e->location ?? '');
        $descTerms  = Tokenizer::terms($e->description ?? '');

        $bucket = [];

        $score = function (array $tokens, float $boost) use (&$bucket, $map) {
            foreach ($tokens as $t) {
                $key = $this->mapKey($t, $map);
                if (!$key) continue;
                $bucket[$key] = ($bucket[$key] ?? 0) + $boost;
            }
        };

        $score($titleTerms, 3.0);
        $score($locTerms,   2.0);
        $score($descTerms,  1.0);

        DB::transaction(function () use ($e, $bucket) {
            DB::table('event_descriptors_map')->where('event_id', $e->id)->delete();

            foreach ($bucket as $key => $sc) {
                $id = DB::table('event_descriptors')->where('key', $key)->value('id');
                if (!$id) {
                    $id = DB::table('event_descriptors')->insertGetId([
                        'key'        => $key,
                        'label'      => ucfirst($key),
                        'aliases'    => null,
                        'weight'     => 1.0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('event_descriptors_map')->insert([
                    'event_id'     => $e->id,
                    'descriptor_id' => $id,
                    'score'        => $sc,
                    'source'       => 'auto',
                    'indexed_at'   => now(),
                ]);
            }
        });
    }

    public function reindexAll(): void
    {
        DB::table('event_descriptors_map')->truncate();
        Event::query()->chunkById(200, function ($chunk) {
            foreach ($chunk as $e) $this->indexEvent($e);
        });
    }

    private function mapKey(string $token, array $map): ?string
    {
        $t = Tokenizer::ascii(mb_strtolower(trim($token)));

        foreach ($map as $key => $aliases) {
            $keyN = Tokenizer::ascii(mb_strtolower($key));
            if ($t === $keyN) return $keyN;

            foreach ((array)$aliases as $a) {
                $aN = Tokenizer::ascii(mb_strtolower($a));
                if ($t === $aN) return $keyN;
            }
        }

        return $t !== '' ? $t : null;
    }
}
