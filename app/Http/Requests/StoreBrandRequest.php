<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBrandRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', 'unique:brands,name'],
            'slug' => ['required', 'string', 'max:255', 'unique:brands,slug'],
            'description' => ['nullable', 'string', 'max:1000'],
            'images' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:3048'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:3048'],
            'status' => ['required', 'boolean'],
        ];
    }
}
