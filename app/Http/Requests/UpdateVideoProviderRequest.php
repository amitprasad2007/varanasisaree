<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVideoProviderRequest extends FormRequest
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
            'name' => 'required|string|max:255|unique:video_providers,name,' . $this->route('video_provider')->id,
            'base_url' => 'required|string|max:255',
            'logo' => 'nullable|image|max:1024',
            'status' => 'required|in:active,inactive',
        ];
    }
}
