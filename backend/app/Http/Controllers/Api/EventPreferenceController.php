<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventPreferenceController extends Controller
{
    public function prefer(Request $req, int $id)
    {
        DB::table('events')->where('id', $id)->update([
            'preferences_count' => DB::raw('preferences_count + 1'),
            'updated_at' => now(),
        ]);
        return response()->json(['ok' => true]);
    }
}
