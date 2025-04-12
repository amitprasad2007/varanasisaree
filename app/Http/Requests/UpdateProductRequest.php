<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
       $productId = $this->route('product'); // This should return just the ID (e.g. 2)

    return [
        'name' => 'required|string',
        'slug' => [
            'required',
            'string',
            Rule::unique('products', 'slug')->ignore($productId), // Ignore current product when updating
        ],
        'category_id' => 'required|exists:categories,id',
        'subcategory_id' => 'required|exists:categories,id',
        'brand_id' => 'required|exists:brands,id',
        'description' => 'required|string',
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
        'is_bestseller' => 'nullable|boolean'
    ];
    }
}
