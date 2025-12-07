<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Support\Search\Tokenizer;

class ProductSearch
{
    public function indexProduct(Product $p): void
    {
        $nameTerms = Tokenizer::terms($p->name ?? '');
        $descTerms = Tokenizer::terms($p->description ?? '');
        $skuTerms  = Tokenizer::terms($p->sku ?? '');

        $countIn = function (array $needles, string $haystack): array {
            $bag = [];
            $hay = mb_strtolower(Tokenizer::ascii($haystack ?? ''));
            foreach ($needles as $t) {
                $bag[$t] = preg_match_all('/\b' . preg_quote($t, '/') . '\b/u', $hay) ?: 0;
            }
            return $bag;
        };

        $cName = $countIn($nameTerms, $p->name ?? '');
        $cDesc = $countIn($descTerms, $p->description ?? '');
        $cSku  = $countIn($skuTerms, $p->sku ?? '');

        $allTerms = collect($nameTerms)->merge($descTerms)->merge($skuTerms)->unique()->values();

        DB::transaction(function () use ($p, $allTerms, $cName, $cDesc, $cSku) {
            DB::table('product_terms')->where('product_id', $p->id)->delete();

            foreach ($allTerms as $term) {
                $termId = DB::table('search_terms')->where('term', $term)->value('id');
                if (!$termId) {
                    $termId = DB::table('search_terms')->insertGetId([
                        'term' => $term,
                        'df' => 0,
                        'search_weight' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $inName = $cName[$term] ?? 0;
                $inDesc = $cDesc[$term] ?? 0;
                $inSku  = $cSku[$term] ?? 0;

                DB::table('product_terms')->insert([
                    'product_id' => $p->id,
                    'term_id' => $termId,
                    'in_name' => $inName,
                    'in_description' => $inDesc,
                    'in_sku' => $inSku,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('search_terms')->where('id', $termId)->increment('df', 1);
            }
        });
    }

    public function removeProduct(Product $p): void
    {
        DB::transaction(function () use ($p) {
            $termIds = DB::table('product_terms')->where('product_id', $p->id)->pluck('term_id');
            DB::table('product_terms')->where('product_id', $p->id)->delete();
            foreach ($termIds as $tid) {
                DB::table('search_terms')->where('id', $tid)->where('df', '>', 0)->decrement('df', 1);
            }
        });
    }

    public function reindexAll(): void
    {
        DB::table('product_terms')->truncate();
        DB::table('search_terms')->update(['df' => 0]);

        Product::query()->chunkById(200, function ($chunk) {
            foreach ($chunk as $p) {
                $this->indexProduct($p);
            }
        });
    }

    public function search(
        string $q,
        ?string $categorySlug,
        int $page = 1,
        int $perPage = 15,
        ?string $condition = null
    ): LengthAwarePaginator {
        $terms = Tokenizer::terms($q);

        DB::table('search_queries')->insert([
            'q' => $q,
            'terms' => json_encode($terms, JSON_UNESCAPED_UNICODE),
            'results_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if (empty($terms)) {
            return new LengthAwarePaginator([], 0, $perPage, $page);
        }

        DB::table('search_terms')->whereIn('term', $terms)->update([
            'search_weight' => DB::raw('search_weight + 1'),
            'last_searched_at' => now(),
        ]);

        $candidateLimit = (int) config('search.candidate_limit', 300);
        $booleanAND = implode(' ', array_map(fn($t) => '+' . $t . '*', $terms));
        $booleanOR  = implode(' ', array_map(fn($t) => $t . '*',  $terms));

        $candidatesAND = Product::query()
            ->select('products.id')
            ->where('status', 'active')
            ->when(
                $categorySlug,
                fn($q) =>
                $q->whereHas('category', fn($w) => $w->where('slug', $categorySlug))
            )
            ->when($condition, fn($q) => $q->where('condition', $condition))
            ->whereRaw("MATCH(name, description) AGAINST(? IN BOOLEAN MODE)", [$booleanAND])
            ->limit($candidateLimit)
            ->pluck('id');

        $candidatesOR = collect();
        if ($candidatesAND->count() < $candidateLimit) {
            $candidatesOR = Product::query()
                ->select('products.id')
                ->where('status', 'active')
                ->when(
                    $categorySlug,
                    fn($q) =>
                    $q->whereHas('category', fn($w) => $w->where('slug', $categorySlug))
                )
                ->when($condition, fn($q) => $q->where('condition', $condition))
                ->whereRaw("MATCH(name, description) AGAINST(? IN BOOLEAN MODE)", [$booleanOR])
                ->limit($candidateLimit)
                ->pluck('id');
        }

        $candidatesSKU = collect();
        if ($candidatesAND->count() + $candidatesOR->count() < $candidateLimit) {
            $candidatesSKU = Product::query()
                ->select('products.id')
                ->where('status', 'active')
                ->when(
                    $categorySlug,
                    fn($q) =>
                    $q->whereHas('category', fn($w) => $w->where('slug', $categorySlug))
                )
                ->when($condition, fn($q) => $q->where('condition', $condition))
                ->whereRaw("MATCH(sku) AGAINST(? IN BOOLEAN MODE)", [$booleanOR])
                ->limit($candidateLimit)
                ->pluck('id');
        }

        $candidates = $candidatesAND->merge($candidatesOR)->merge($candidatesSKU)->unique();
        if ($candidates->isEmpty()) {
            $termIds = DB::table('search_terms')->whereIn('term', $terms)->pluck('id');
            $candidates = DB::table('product_terms')
                ->select('product_id')
                ->whereIn('term_id', $termIds)
                ->limit($candidateLimit)
                ->pluck('product_id');
        }
        if ($candidates->isEmpty()) {
            return new LengthAwarePaginator([], 0, $perPage, $page);
        }

        $boosts = config('search.field_boosts');
        $bName = (float)($boosts['name'] ?? 3.0);
        $bSku  = (float)($boosts['sku'] ?? 2.0);
        $bDesc = (float)($boosts['description'] ?? 1.0);

        $alpha          = (float) config('search.popularity_alpha', 0.15);
        $leadMultiplier = (float) config('search.lead_term_multiplier', 1.25);
        $leadTerm       = $terms[0] ?? null;

        $clickBeta = (float) config('search.click_beta', 0.02);
        $clickCap  = (int)   config('search.click_cap', 100);

        $rows = DB::table('products as p')
            ->leftJoin('product_search_meta as psm', 'psm.product_id', '=', 'p.id')
            ->join('product_terms as pt', 'pt.product_id', '=', 'p.id')
            ->join('search_terms as st', 'st.id', '=', 'pt.term_id')
            ->whereIn('p.id', $candidates)
            ->whereIn('st.term', $terms)
            ->where('p.status', 'active')
            ->when($categorySlug, function ($q) use ($categorySlug) {
                $q->join('categories as c', 'c.id', '=', 'p.category_id')
                    ->where('c.slug', $categorySlug);
            })
            ->when($condition, fn($q) => $q->where('p.condition', $condition))
            ->groupBy('p.id')
            ->selectRaw(
                'p.id as id,
         SUM(
            ((pt.in_name * ?) + (pt.in_sku * ?) + (pt.in_description * ?))
            * (1 + st.search_weight * ?)
            * (CASE WHEN ? IS NOT NULL AND st.term = ? THEN ? ELSE 1 END)
            * (1 + LEAST(COALESCE(psm.clicks, 0), ?) * ?)
         ) as base_score,
         COUNT(DISTINCT st.term) as matched_terms,
         MAX(CASE WHEN ? IS NOT NULL AND st.term = ? AND pt.in_name > 0 THEN 1 ELSE 0 END) as lead_in_name',
                [
                    $bName,
                    $bSku,
                    $bDesc,
                    $alpha,
                    $leadTerm,
                    $leadTerm,
                    $leadMultiplier,
                    $clickCap,
                    $clickBeta,
                    $leadTerm,
                    $leadTerm
                ]
            )
            ->get();




        $allTermsBonus = 4.0;

        $scores = collect();
        $phrase = Tokenizer::phrase($terms);
        $pbName = (float)config('search.phrase_boost.name', 5.0);
        $pbDesc = (float)config('search.phrase_boost.description', 2.0);

        foreach ($rows as $r) {
            $p = Product::find($r->id);
            if (!$p) continue;

            $score = (float)$r->base_score;

            if ((int)$r->matched_terms === count($terms)) {
                $score += $allTermsBonus;
            }

            $nameNorm = mb_strtolower(Tokenizer::ascii($p->name ?? ''));
            $descNorm = mb_strtolower(Tokenizer::ascii($p->description ?? ''));
            if ($phrase && str_contains($nameNorm, $phrase)) $score += $pbName;
            if ($phrase && str_contains($descNorm, $phrase)) $score += $pbDesc;

            foreach ($terms as $t) {
                if ($p->sku && stripos(Tokenizer::ascii($p->sku), $t) !== false) {
                    $score += 1.5;
                }
            }

            $scores->push(['id' => $p->id, 'score' => $score]);
        }

        $orderedIds = $scores->sortByDesc('score')->pluck('id')->values()->all();
        $total = count($orderedIds);

        $slice = array_slice($orderedIds, ($page - 1) * $perPage, $perPage);
        $items = Product::with('category')->whereIn('id', $slice)->get()
            ->sortBy(fn($pp) => array_search($pp->id, $slice))
            ->values();

        if (!empty($slice)) {
            DB::table('products')->whereIn('id', $slice)->update([
                'searches_count' => DB::raw('searches_count + 1')
            ]);
        }

        if (auth('sanctum')->check() && !empty($slice)) {
            $uid = auth('sanctum')->id();
            app(\App\Services\UserSignals::class)->impression($uid, $slice);
            app(\App\Services\UserSignals::class)->recordSearchQuery($uid, $q);
        }

        DB::table('search_queries')->orderByDesc('id')->limit(1)->update(['results_count' => $total]);

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }
}
