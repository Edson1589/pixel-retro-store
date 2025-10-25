<?php

namespace App\Services;

use App\Models\Product;
use App\Support\Search\Tokenizer;
use Illuminate\Support\Facades\DB;

class DescriptorEngine
{
    public function indexProduct(Product $p): void
    {
        $map = config('descriptors', []);

        $nameTerms = Tokenizer::terms($p->name ?? '');
        $descTerms = Tokenizer::terms($p->description ?? '');
        $skuTerms  = Tokenizer::terms($p->sku ?? '');

        $bucket = [];

        $score = function (array $tokens, float $boost) use (&$bucket, $map) {
            foreach ($tokens as $t) {
                $key = $this->mapKey($t, $map);
                if (!$key) continue;
                $bucket[$key] = ($bucket[$key] ?? 0) + $boost;
            }
        };

        $score($nameTerms, 3.0);
        $score($skuTerms,  2.0);
        $score($descTerms, 1.0);

        DB::transaction(function () use ($p, $bucket) {
            DB::table('product_descriptors')->where('product_id', $p->id)->delete();

            foreach ($bucket as $key => $sc) {
                $id = DB::table('descriptors')->where('key', $key)->value('id');
                if (!$id) {
                    $id = DB::table('descriptors')->insertGetId([
                        'key' => $key,
                        'label' => ucfirst($key),
                        'aliases' => null,
                        'weight' => 1.0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('product_descriptors')->insert([
                    'product_id' => $p->id,
                    'descriptor_id' => $id,
                    'score' => $sc,
                    'source' => 'auto',
                    'indexed_at' => now(),
                ]);
            }
        });
    }

    public function reindexAll(): void
    {
        DB::table('product_descriptors')->truncate();
        Product::query()->chunkById(200, function ($chunk) {
            foreach ($chunk as $p) $this->indexProduct($p);
        });
    }

    private function mapKey(string $token, array $map): ?string
    {
        $t = \App\Support\Search\Tokenizer::ascii(mb_strtolower(trim($token)));

        foreach ($map as $key => $aliases) {
            $keyN = \App\Support\Search\Tokenizer::ascii(mb_strtolower($key));
            if ($t === $keyN) return $keyN;

            foreach ((array)$aliases as $a) {
                $aN = \App\Support\Search\Tokenizer::ascii(mb_strtolower($a));
                if ($t === $aN) return $keyN;
            }
        }

        return $t !== '' ? $t : null;
    }
}
