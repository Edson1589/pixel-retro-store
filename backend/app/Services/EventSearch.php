<?php

namespace App\Services;

use App\Models\Event;
use App\Support\Search\Tokenizer;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class EventSearch
{
    public function indexEvent(Event $e): void
    {
        $titleTerms = Tokenizer::terms($e->title ?? '');
        $descTerms  = Tokenizer::terms($e->description ?? '');
        $locTerms   = Tokenizer::terms($e->location ?? '');

        $countIn = function (array $needles, string $haystack): array {
            $bag = [];
            $hay = mb_strtolower(Tokenizer::ascii($haystack ?? ''));
            foreach ($needles as $t) {
                $bag[$t] = preg_match_all('/\b' . preg_quote($t, '/') . '\b/u', $hay) ?: 0;
            }
            return $bag;
        };

        $cTitle = $countIn($titleTerms, $e->title ?? '');
        $cDesc  = $countIn($descTerms, $e->description ?? '');
        $cLoc   = $countIn($locTerms, $e->location ?? '');

        $allTerms = collect($titleTerms)->merge($descTerms)->merge($locTerms)->unique()->values();

        DB::transaction(function () use ($e, $allTerms, $cTitle, $cDesc, $cLoc) {
            DB::table('event_terms')->where('event_id', $e->id)->delete();

            foreach ($allTerms as $term) {
                $termId = DB::table('search_terms_events')->where('term', $term)->value('id');
                if (!$termId) {
                    $termId = DB::table('search_terms_events')->insertGetId([
                        'term' => $term,
                        'df' => 0,
                        'search_weight' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $inTitle = $cTitle[$term] ?? 0;
                $inDesc  = $cDesc[$term] ?? 0;
                $inLoc   = $cLoc[$term] ?? 0;

                DB::table('event_terms')->insert([
                    'event_id' => $e->id,
                    'term_id' => $termId,
                    'in_title' => $inTitle,
                    'in_description' => $inDesc,
                    'in_location' => $inLoc,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('search_terms_events')->where('id', $termId)->increment('df', 1);
            }
        });
    }

    public function removeEvent(Event $e): void
    {
        DB::transaction(function () use ($e) {
            $termIds = DB::table('event_terms')->where('event_id', $e->id)->pluck('term_id');
            DB::table('event_terms')->where('event_id', $e->id)->delete();
            foreach ($termIds as $tid) {
                DB::table('search_terms_events')->where('id', $tid)->where('df', '>', 0)->decrement('df', 1);
            }
        });
    }

    public function reindexAll(): void
    {
        DB::table('event_terms')->truncate();
        DB::table('search_terms_events')->update(['df' => 0]);

        Event::query()->where('status', 'published')->chunkById(200, function ($chunk) {
            foreach ($chunk as $e) {
                $this->indexEvent($e);
            }
        });
    }

    public function search(string $q, ?string $type, bool $upcoming, int $page = 1, int $perPage = 12): LengthAwarePaginator
    {
        $terms = Tokenizer::terms($q);

        DB::table('search_queries_events')->insert([
            'q' => $q,
            'terms' => json_encode($terms, JSON_UNESCAPED_UNICODE),
            'results_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if (empty($terms)) {
            return new LengthAwarePaginator([], 0, $perPage, $page);
        }

        DB::table('search_terms_events')->whereIn('term', $terms)->update([
            'search_weight' => DB::raw('search_weight + 1'),
            'last_searched_at' => now(),
        ]);

        $limit = (int) config('search_events.candidate_limit', 300);
        $booleanAND = implode(' ', array_map(fn($t) => '+' . $t . '*', $terms));
        $booleanOR  = implode(' ', array_map(fn($t) => $t . '*',  $terms));

        $base = Event::query()
            ->select('events.id')
            ->where('events.status', 'published')
            ->when($type, fn($q2) => $q2->where('events.type', $type))
            ->when($upcoming, fn($q2) => $q2->where('events.start_at', '>=', Carbon::now()));

        $cAND = (clone $base)
            ->whereRaw("MATCH(title, description, location) AGAINST(? IN BOOLEAN MODE)", [$booleanAND])
            ->limit($limit)
            ->pluck('id');

        $cOR = collect();
        if ($cAND->count() < $limit) {
            $cOR = (clone $base)
                ->whereRaw("MATCH(title, description, location) AGAINST(? IN BOOLEAN MODE)", [$booleanOR])
                ->limit($limit)
                ->pluck('id');
        }

        $candidates = $cAND->merge($cOR)->unique();
        if ($candidates->isEmpty()) {
            $termIds = DB::table('search_terms_events')->whereIn('term', $terms)->pluck('id');
            $candidates = DB::table('event_terms')
                ->select('event_id')
                ->whereIn('term_id', $termIds)
                ->limit($limit)
                ->pluck('event_id');
        }
        if ($candidates->isEmpty()) {
            return new LengthAwarePaginator([], 0, $perPage, $page);
        }

        $boosts = config('search_events.field_boosts');
        $bTitle = (float)($boosts['title'] ?? 3.5);
        $bLoc   = (float)($boosts['location'] ?? 2.0);
        $bDesc  = (float)($boosts['description'] ?? 1.0);

        $alpha     = (float) config('search_events.popularity_alpha', 0.15);
        $clickBeta = (float) config('search_events.click_beta', 0.02);
        $clickCap  = (int)   config('search_events.click_cap', 100);

        $rows = DB::table('events as e')
            ->leftJoin('event_search_meta as esm', 'esm.event_id', '=', 'e.id')
            ->join('event_terms as et', 'et.event_id', '=', 'e.id')
            ->join('search_terms_events as st', 'st.id', '=', 'et.term_id')
            ->whereIn('e.id', $candidates)
            ->whereIn('st.term', $terms)
            ->where('e.status', 'published')
            ->when($type, fn($q2) => $q2->where('e.type', $type))
            ->when($upcoming, fn($q2) => $q2->where('e.start_at', '>=', Carbon::now()))
            ->groupBy('e.id')
            ->selectRaw(
                'e.id as id,
         SUM(
            ((et.in_title * ?) + (et.in_location * ?) + (et.in_description * ?))
            * (1 + st.search_weight * ?)
            * (1 + LEAST(COALESCE(esm.clicks, 0), ?) * ?)
         ) as base_score,
         COUNT(DISTINCT st.term) as matched_terms',
                [
                    $bTitle,
                    $bLoc,
                    $bDesc,
                    $alpha,
                    $clickCap,
                    $clickBeta
                ]
            )
            ->get();


        $phrase = Tokenizer::phrase($terms);
        $pbTitle = (float)config('search_events.phrase_boost.title', 5.0);
        $pbDesc  = (float)config('search_events.phrase_boost.description', 2.0);
        $allTermsBonus = 4.0;

        $scores = collect();
        foreach ($rows as $r) {
            $e = Event::find($r->id);
            if (!$e) continue;

            $score = (float)$r->base_score;

            if ((int)$r->matched_terms === count($terms)) {
                $score += $allTermsBonus;
            }

            $titleNorm = mb_strtolower(Tokenizer::ascii($e->title ?? ''));
            $descNorm  = mb_strtolower(Tokenizer::ascii($e->description ?? ''));
            if ($phrase && str_contains($titleNorm, $phrase)) $score += $pbTitle;
            if ($phrase && str_contains($descNorm,  $phrase)) $score += $pbDesc;

            if ($upcoming && $e->start_at) {
                $diffDays = max(0.0, (float) now()->diffInDays($e->start_at, false));
                $score += max(0.0, 2.0 - min($diffDays, 20) * 0.1);
            }

            $scores->push(['id' => $e->id, 'score' => $score]);
        }

        $ordered = $scores->sortByDesc('score')->pluck('id')->values()->all();
        $total = count($ordered);
        $slice = array_slice($ordered, ($page - 1) * $perPage, $perPage);

        $items = Event::query()
            ->whereIn('id', $slice)
            ->with([])
            ->get()
            ->sortBy(fn($ev) => array_search($ev->id, $slice))
            ->values();

        if (!empty($slice)) {
            DB::table('events')->whereIn('id', $slice)->update([
                'searches_count' => DB::raw('searches_count + 1'),
                'updated_at'     => now(),
            ]);
        }

        DB::table('search_queries_events')->orderByDesc('id')->limit(1)->update(['results_count' => $total]);

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }
}
