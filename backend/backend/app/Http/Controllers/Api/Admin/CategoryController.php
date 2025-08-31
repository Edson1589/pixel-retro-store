<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Category::orderBy('name')->paginate(20));
    }

    public function show(int $id)
    { // 👈 NUEVO
        $cat = Category::withCount('products')->findOrFail($id);
        return response()->json($cat);
    }

    public function store(CategoryRequest $request)
    {
        $cat = Category::create($request->validated());
        return response()->json($cat, 201);
    }

    public function update(CategoryRequest $request, int $id)
    {
        $cat = Category::findOrFail($id);
        $cat->update($request->validated());
        return response()->json($cat);
    }

    public function destroy(int $id)
    {
        Category::findOrFail($id)->delete();
        return response()->json(['message' => 'deleted']);
    }
}
