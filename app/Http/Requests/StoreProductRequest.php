<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string',
            'slug' => 'required|string|unique:products,slug',
            'category_id' => 'nullable|exists:categories,id',
            'subcategory_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount' => 'required|numeric|between:0,100',
            'stock_quantity' => 'required|integer|min:0',
            'fabric' => 'nullable|string',
            'color' => 'nullable|string',
            'size' => 'nullable|string',
            'work_type' => 'nullable|string',
            'occasion' => 'nullable|string',
            'weight' => 'nullable|numeric|min:0',
            'status' => ['required', 'boolean'],
            'is_bestseller' => 'nullable|boolean',
        ];
    }
}
