<?php

namespace App\Services;

use App\Models\Event;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class EventTrending
{
    public function list(?string $type, bool $upcoming, int $page = 1, int $perPage = 12): LengthAwarePaginator
    {
        $wP = (float) config('trending_events.weight_preferences', 3.0);
        $wS = (float) config('trending_events.weight_searches', 1.0);
        $useDesc = (bool) config('trending_events.descriptor_tiebreaker', true);
        $descBeta = (float) config('trending_events.descriptor_beta', 0.05);

        $descAgg = DB::table('event_descriptors_map as edm')
            ->join('event_descriptors as ed', 'ed.id', '=', 'edm.descriptor_id')
            ->selectRaw('edm.event_id, SUM(ed.weight * edm.score) as desc_sum')
            ->groupBy('edm.event_id');

        $q = DB::table('events as e')
            ->leftJoinSub($descAgg, 'dp', fn($j) => $j->on('dp.event_id', '=', 'e.id'))
            ->where('e.status', 'published')
            ->when($type, fn($qq) => $qq->where('e.type', $type))
            ->when($upcoming, fn($qq) => $qq->where('e.start_at', '>=', Carbon::now()))
            ->selectRaw(
                'e.id,
                 (e.preferences_count * ?) + (e.searches_count * ?) as trending_score,
                 COALESCE(dp.desc_sum, 0) as desc_sum,
                 e.preferences_count, e.searches_count',
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

        $items = Event::query()
            ->whereIn('id', $slice)
            ->orderByRaw('FIELD(id,' . implode(',', $slice) . ')')
            ->get();

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }
}
