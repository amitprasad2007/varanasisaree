<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTestimonialRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'testimonial' => 'required|string',
            'testimonial_hi' => 'nullable|string',
            'rating' => 'required|integer|min:1|max:5',
            'designation' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
            'approval_status' => 'required|in:pending,approved,rejected',
        ];
    }
}
