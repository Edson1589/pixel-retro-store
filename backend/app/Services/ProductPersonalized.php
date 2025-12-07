<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProductPersonalized
{
    public function listForUser(
        int $userId,
        ?string $categorySlug,
        int $page = 1,
        int $perPage = 15,
        ?string $condition = null
    ): LengthAwarePaginator {
        $wP = (float) config('trending.weight_preferences', 3.0);
        $wS = (float) config('trending.weight_searches', 1.0);

        $beta    = (float) config('personalization.beta_prod', 0.05);
        $capProd = (int)   config('personalization.cap_prod', 50);
        $lambda  = (float) config('personalization.lambda_desc', 0.10);
        $capDesc = (int)   config('personalization.cap_desc', 40);

        $weights = config('personalization.per_event');
        $wView = (float)($weights['view'] ?? 1.0);
        $wAdd  = (float)($weights['add'] ?? 3.0);
        $wBuy  = (float)($weights['purchase'] ?? 6.0);

        $topK        = (int)   config('personalization.top_k', 5);
        $topMinScore = (float) config('personalization.top_min_score', 1.2);
        $gammaCore   = (float) config('personalization.gamma_core', 0.15);
        $capCore     = (int)   config('personalization.cap_core', 30);
        $nameBonus   = (float) config('personalization.name_hit_bonus', 0.25);

        $topKeys = DB::table('user_descriptors')
            ->where('user_id', $userId)
            ->where('score', '>=', $topMinScore)
            ->orderByDesc('score')
            ->limit($topK)
            ->pluck('key')
            ->all();

        $userAgg = DB::table('user_product_signals')
            ->where('user_id', $userId)
            ->select('product_id')
            ->selectRaw('(SUM(views) * ?) + (SUM(adds) * ?) + (SUM(purchases) * ?) AS uprod', [$wView, $wAdd, $wBuy])
            ->groupBy('product_id');

        $descAgg = DB::table('product_descriptors as pd')
            ->join('descriptors as d', 'd.id', '=', 'pd.descriptor_id')
            ->join('user_descriptors as ud', function ($j) use ($userId) {
                $j->on('ud.key', '=', 'd.key')->where('ud.user_id', '=', $userId);
            })
            ->selectRaw('pd.product_id, SUM(pd.score * ud.score) as sim_desc')
            ->groupBy('pd.product_id');

        $coreAgg = null;
        if (!empty($topKeys)) {
            $coreAgg = DB::table('product_descriptors as pd')
                ->join('descriptors as d', 'd.id', '=', 'pd.descriptor_id')
                ->whereIn('d.key', $topKeys)
                ->selectRaw('pd.product_id,
                             SUM(pd.score) as core_overlap,
                             MAX(CASE WHEN pd.score >= 3 THEN 1 ELSE 0 END) as core_name_hit')
                ->groupBy('pd.product_id');
        }

        $q = DB::table('products as p')
            ->leftJoinSub($userAgg, 'ua', fn($j) => $j->on('ua.product_id', '=', 'p.id'))
            ->leftJoinSub($descAgg, 'da', fn($j) => $j->on('da.product_id', '=', 'p.id'))
            ->when($categorySlug, function ($q) use ($categorySlug) {
                $q->whereExists(function ($qq) use ($categorySlug) {
                    $qq->from('categories as c')
                        ->whereColumn('c.id', 'p.category_id')
                        ->where('c.slug', $categorySlug);
                });
            })
            ->where('p.status', 'active')
            ->when($condition, fn($qq) => $qq->where('p.condition', $condition));

        if ($coreAgg) {
            $q->leftJoinSub($coreAgg, 'ca', fn($j) => $j->on('ca.product_id', '=', 'p.id'));
        }

        $q->selectRaw(
            'p.id,
     (p.preferences_count * ?) + (p.searches_count * ?) as public_score,
     COALESCE(ua.uprod, 0) as uprod,
     COALESCE(da.sim_desc, 0) as sim_desc',
            [$wP, $wS]
        );

        if ($coreAgg) {
            $q->addSelect(DB::raw('COALESCE(ca.core_overlap, 0) as core_overlap'));
            $q->addSelect(DB::raw('COALESCE(ca.core_name_hit, 0) as core_name_hit'));
        } else {
            $q->addSelect(DB::raw('0 as core_overlap'));
            $q->addSelect(DB::raw('0 as core_name_hit'));
        }

        $rows = $q->get();

        $scored = $rows->map(function ($r) use ($beta, $capProd, $lambda, $capDesc, $gammaCore, $capCore, $nameBonus) {
            $public = (float)$r->public_score;
            $uprod  = (float)$r->uprod;
            $sim    = (float)$r->sim_desc;
            $core   = (float)$r->core_overlap;
            $nameHit = ((int)$r->core_name_hit) === 1;

            $score = max(0.0, $public);
            $score *= (1 + min($uprod, $capProd) * $beta);
            $score *= (1 + min($sim,   $capDesc) * $lambda);

            if ($core > 0) {
                $score *= (1 + min($core, $capCore) * $gammaCore);
                if ($nameHit) {
                    $score *= (1 + $nameBonus);
                }
            }

            return [
                'id'       => (int)$r->id,
                'score'    => $score,
                'is_core'  => $core > 0 ? 1 : 0,
            ];
        });

        $coreFirst = $scored->filter(fn($x) => $x['is_core'] === 1)
            ->sortByDesc('score')
            ->values();
        $others    = $scored->filter(fn($x) => $x['is_core'] === 0)
            ->sortByDesc('score')
            ->values();

        $ordered = $coreFirst->concat($others)->pluck('id')->values()->all();

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
