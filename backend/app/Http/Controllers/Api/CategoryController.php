<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    //PR
    public function index()
    {
        return response()->json(
            Category::query()
                ->select('id', 'name', 'slug')
                ->orderBy('name')
                ->get()
        );
    }
}
