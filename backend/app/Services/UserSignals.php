<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Support\Search\Tokenizer;

class UserSignals
{
    public function record(int $userId, int $productId, string $kind): void
    {
        $kind = in_array($kind, ['view', 'add', 'purchase'], true) ? $kind : 'view';

        DB::transaction(function () use ($userId, $productId, $kind) {
            $exists = DB::table('user_product_signals')
                ->where('user_id', $userId)->where('product_id', $productId)->exists();

            if (!$exists) {
                DB::table('user_product_signals')->insert([
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'impressions' => 0,
                    'views' => 0,
                    'adds' => 0,
                    'purchases' => 0,
                    'last_interacted_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $col = $kind === 'add' ? 'adds' : ($kind === 'purchase' ? 'purchases' : 'views');
            DB::table('user_product_signals')
                ->where('user_id', $userId)->where('product_id', $productId)
                ->update([$col => DB::raw("$col + 1"), 'last_interacted_at' => now(), 'updated_at' => now()]);

            $deltaMap = config('personalization.descriptor_update');
            $delta = (float)($deltaMap[$kind] ?? 0.5);

            if ($delta > 0) {
                $rows = DB::table('product_descriptors as pd')
                    ->join('descriptors as d', 'd.id', '=', 'pd.descriptor_id')
                    ->select('d.key', 'pd.score')
                    ->where('pd.product_id', $productId)
                    ->get();


                foreach ($rows as $r) {
                    DB::table('user_descriptors')->updateOrInsert(
                        ['user_id' => $userId, 'key' => $r->key],
                        [
                            'score' => DB::raw('GREATEST(0, score + ' . ($r->score * $delta) . ')'),
                            'updated_at' => now(),
                            'created_at' => now()
                        ]
                    );
                }
            }
        });
    }

    public function impression(int $userId, array $productIds): void
    {
        if (empty($productIds)) return;

        DB::transaction(function () use ($userId, $productIds) {
            foreach ($productIds as $pid) {
                $exists = DB::table('user_product_signals')
                    ->where('user_id', $userId)->where('product_id', $pid)->exists();

                if (!$exists) {
                    DB::table('user_product_signals')->insert([
                        'user_id' => $userId,
                        'product_id' => $pid,
                        'impressions' => 1,
                        'views' => 0,
                        'adds' => 0,
                        'purchases' => 0,
                        'last_interacted_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('user_product_signals')
                        ->where('user_id', $userId)->where('product_id', $pid)
                        ->update(['impressions' => DB::raw('impressions + 1'), 'updated_at' => now()]);
                }
            }
        });
    }

    public function recordSearchQuery(int $userId, string $q): void
    {
        $boost = (float) config('personalization.descriptor_from_search', 0.8);
        if ($boost <= 0) return;

        $terms = Tokenizer::terms($q);
        if (empty($terms)) return;

        DB::transaction(function () use ($userId, $terms, $boost) {
            foreach ($terms as $t) {
                DB::table('user_descriptors')->updateOrInsert(
                    ['user_id' => $userId, 'key' => $t],
                    [
                        'score' => DB::raw('GREATEST(0, score + ' . $boost . ')'),
                        'updated_at' => now(),
                        'created_at' => now()
                    ]
                );
            }
        });
    }
}
