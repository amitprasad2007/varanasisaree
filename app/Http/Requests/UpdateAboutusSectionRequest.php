<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAboutusSectionRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('section_content'))) {
            $decoded = json_decode($this->input('section_content'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['section_content' => $decoded]);
            }
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'section_title' => 'required|string|max:255',
            'section_content' => 'required|array',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp,gif|max:2048',
            'order' => 'nullable|integer|min:0',
            'status' => 'required|in:active,inactive',
        ];
    }
}


