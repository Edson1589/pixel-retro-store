<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\Search\Tokenizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchTelemetryController extends Controller
{

    public function productImpressions(Request $req)
    {
        $ids = $req->validate(['product_ids' => 'required|array', 'product_ids.*' => 'integer']);
        DB::table('products')->whereIn('id', $ids['product_ids'])
            ->update(['searches_count' => DB::raw('searches_count + 1')]);
        return response()->json(['ok' => true]);
    }

    public function productClick(Request $req)
    {
        $validated = $req->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'q'          => ['required', 'string', 'max:255'],
            'source'     => ['nullable', 'string', 'max:64'],
        ]);

        $productId = (int) $validated['product_id'];
        $q         = (string) $validated['q'];
        $source    = $validated['source'] ?? null;

        $terms = Tokenizer::terms($q);

        DB::transaction(function () use ($productId, $q, $terms, $source) {
            $exists = DB::table('product_search_meta')->where('product_id', $productId)->exists();
            if ($exists) {
                DB::table('product_search_meta')
                    ->where('product_id', $productId)
                    ->update([
                        'clicks' => DB::raw('clicks + 1'),
                        'last_clicked_at' => now(),
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('product_search_meta')->insert([
                    'product_id' => $productId,
                    'clicks' => 1,
                    'last_clicked_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if (!empty($terms)) {
                $boost = (int) config('search.term_click_boost', 3);
                DB::table('search_terms')->whereIn('term', $terms)->update([
                    'search_weight' => DB::raw('search_weight + ' . max(1, $boost)),
                    'last_searched_at' => now(),
                ]);
            }

            DB::table('search_clicks')->insert([
                'product_id' => $productId,
                'q'          => $q,
                'terms'      => json_encode($terms, JSON_UNESCAPED_UNICODE),
                'source'     => $source,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json(['ok' => true]);
    }

    public function eventClick(Request $req)
    {
        $validated = $req->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'q'        => ['required', 'string', 'max:255'],
            'source'   => ['nullable', 'string', 'max:64'],
        ]);

        $eventId = (int) $validated['event_id'];
        $q       = (string) $validated['q'];
        $source  = $validated['source'] ?? null;

        $terms = Tokenizer::terms($q);
        $boost = (int) config('search_events.term_click_boost', 3);

        DB::transaction(function () use ($eventId, $q, $terms, $boost, $source) {
            $exists = DB::table('event_search_meta')->where('event_id', $eventId)->exists();
            if ($exists) {
                DB::table('event_search_meta')->where('event_id', $eventId)->update([
                    'clicks' => DB::raw('clicks + 1'),
                    'last_clicked_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('event_search_meta')->insert([
                    'event_id' => $eventId,
                    'clicks' => 1,
                    'last_clicked_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if (!empty($terms) && $boost > 0) {
                DB::table('search_terms_events')->whereIn('term', $terms)->update([
                    'search_weight' => DB::raw('search_weight + ' . max(1, $boost)),
                    'last_searched_at' => now(),
                ]);
            }

            DB::table('search_clicks_events')->insert([
                'event_id' => $eventId,
                'q'        => $q,
                'terms'    => json_encode($terms, JSON_UNESCAPED_UNICODE),
                'source'   => $source,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json(['ok' => true]);
    }
}
