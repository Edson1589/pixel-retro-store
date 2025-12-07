<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EventRequest;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $per = max(1, min(100, (int) $request->integer('per_page', 20)));
        $q = Event::query();
        if ($s = $request->string('search')->toString()) {
            $q->where('title', 'like', "%$s%");
        }
        if ($t = $request->string('type')->toString()) {
            $q->where('type', $t);
        }
        return response()->json($q->orderByDesc('start_at')->paginate($per));
    }

    public function show(int $id)
    {
        return response()->json(Event::withCount('registrations')->findOrFail($id));
    }

    public function store(EventRequest $request)
    {
        $data = $request->validated();
        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('events', 'public');
            $data['banner_url'] = Storage::url($path);
        }
        $e = Event::create($data);
        return response()->json($e, 201);
    }


    public function update(EventRequest $request, int $id)
    {
        $e = Event::findOrFail($id);
        $data = $request->validated();
        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('events', 'public');
            $data['banner_url'] = Storage::url($path);
        }
        $e->update($data);
        return response()->json($e);
    }

    public function destroy(int $id)
    {
        Event::findOrFail($id)->delete();
        return response()->json(['message' => 'deleted']);
    }

    public function lookup(Request $request)
    {
        $q = Event::query();

        if ($s = $request->string('search')->toString()) {
            $q->where(function ($qq) use ($s) {
                $qq->where('title', 'like', "%$s%")
                    ->orWhere('location', 'like', "%$s%");
            });
        }

        if ($t = $request->string('type')->toString()) {
            $q->where('type', $t);
        }

        $events = $q->orderByDesc('start_at')
            ->limit(20)
            ->get(['id', 'title', 'type', 'start_at', 'end_at', 'location', 'capacity', 'status']);

        return response()->json($events);
    }
}
