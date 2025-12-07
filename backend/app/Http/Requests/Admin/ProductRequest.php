<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'name'        => ['required', 'string', 'max:180'],
            'slug'        => ['required', 'string', 'max:200', "unique:products,slug,$id"],
            'sku'         => ['nullable', 'string', 'max:80', "unique:products,sku,$id"],
            'description' => ['required', 'string'],
            'price'       => ['required', 'numeric', 'min:0'],
            'stock'       => ['required', 'integer', 'min:0'],
            'condition'   => ['required', 'in:new,used,refurbished'],
            'is_unique'   => ['boolean'],
            'status'      => ['required', 'in:active,draft'],
            'image'       => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'max:4048'],
            'image_url'   => ['nullable', 'url'],
        ];
    }
}
