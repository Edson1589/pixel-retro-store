<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = Product::with('category')->orderByDesc('id');
        if ($s = $request->string('search')->toString()) {
            $q->where('name', 'like', "%$s%");
        }
        return response()->json($q->paginate(20));
    }

    public function store(ProductRequest $request)
    {
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = Storage::url($path);
        }
        $p = Product::create($data);
        return response()->json($p->load('category'), 201);
    }

    public function show(int $id)
    {
        return response()->json(Product::with('category')->findOrFail($id));
    }

    public function update(ProductRequest $request, int $id)
    {
        $p = Product::findOrFail($id);
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = Storage::url($path);
        }
        $p->update($data);
        return response()->json($p->load('category'));
    }

    public function destroy(int $id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'deleted']);
    }
}
