<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProductTrending
{
    public function list(?string $categorySlug, int $page = 1, int $perPage = 15, ?string $condition = null): LengthAwarePaginator
    {
        $wP = (float) config('trending.weight_preferences', 3.0);
        $wS = (float) config('trending.weight_searches', 1.0);
        $useDesc = (bool) config('trending.descriptor_tiebreaker', true);
        $descBeta = (float) config('trending.descriptor_beta', 0.05);

        $descAgg = DB::table('product_descriptors as pd')
            ->join('descriptors as d', 'd.id', '=', 'pd.descriptor_id')
            ->selectRaw('pd.product_id, SUM(d.weight * pd.score) as desc_sum')
            ->groupBy('pd.product_id');

        $q = DB::table('products as p')
            ->leftJoinSub($descAgg, 'dp', fn($j) => $j->on('dp.product_id', '=', 'p.id'))
            ->when($categorySlug, function ($q) use ($categorySlug) {
                $q->whereExists(function ($qq) use ($categorySlug) {
                    $qq->from('categories as c')
                        ->whereColumn('c.id', 'p.category_id')
                        ->where('c.slug', $categorySlug);
                });
            })
            ->where('p.status', 'active')
            ->when($condition, fn($qq) => $qq->where('p.condition', $condition))
            ->selectRaw(
                'p.id,
                 (p.preferences_count * ?) + (p.searches_count * ?) as trending_score,
                 COALESCE(dp.desc_sum, 0) as desc_sum,
                 p.preferences_count, p.searches_count',
                [$wP, $wS]
            );

        $rows = $q->get();

        $scored = $rows->map(function ($r) use ($useDesc, $descBeta) {
            $score = (float)$r->trending_score;
            if ($useDesc) {
                $score *= (1 + min((float)$r->desc_sum, 10) * $descBeta);
            }
            return ['id' => (int)$r->id, 'score' => $score];
        });

        $ordered = $scored->sortByDesc('score')->pluck('id')->values()->all();
        $total   = count($ordered);
        $slice   = array_slice($ordered, ($page - 1) * $perPage, $perPage);

        $items = Product::with('category')
            ->whereIn('id', $slice)
            ->get()
            ->sortBy(fn($p) => array_search($p->id, $slice))
            ->values();

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }
}
