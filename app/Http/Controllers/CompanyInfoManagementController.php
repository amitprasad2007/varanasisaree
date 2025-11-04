<?php

namespace App\Http\Controllers;

use App\Models\CompanyInfo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CompanyInfoManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     * Since there's typically only one company info record, redirect to edit
     */
    public function index()
    {
        $companyInfo = CompanyInfo::first();

        if (!$companyInfo) {
            // If no company info exists, redirect to create
            return redirect()->route('company-info.create');
        }

        return Inertia::render('Admin/CompanyInfo/Index', [
            'companyInfo' => $companyInfo
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Check if company info already exists
        if (CompanyInfo::exists()) {
            return redirect()->route('company-info.index')->with('info', 'Company information already exists. Please edit the existing record.');
        }

        return Inertia::render('Admin/CompanyInfo/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if company info already exists
        if (CompanyInfo::exists()) {
            return redirect()->route('company-info.index')->with('error', 'Company information already exists.');
        }

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'gst_number' => 'nullable|string|max:50',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'support_email' => 'nullable|email|max:255',
            'facebook_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'youtube_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'whatsapp_number' => 'nullable|string|max:20',
            'about_text' => 'nullable|string',
            'founded_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'business_hours' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'additional_data' => 'nullable|json',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('company', 'public');
            $validated['logo_url'] = $path;
        }

        // Parse additional_data JSON if provided as string
        if (isset($validated['additional_data']) && is_string($validated['additional_data'])) {
            $validated['additional_data'] = json_decode($validated['additional_data'], true);
        }

        unset($validated['logo']); // Remove the file object

        CompanyInfo::create($validated);

        return redirect()->route('company-info.index')->with('success', 'Company information created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $companyInfo = CompanyInfo::findOrFail($id);

        return Inertia::render('Admin/CompanyInfo/Show', [
            'companyInfo' => $companyInfo
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $companyInfo = CompanyInfo::findOrFail($id);

        return Inertia::render('Admin/CompanyInfo/Edit', [
            'companyInfo' => $companyInfo
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $companyInfo = CompanyInfo::findOrFail($id);

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'gst_number' => 'nullable|string|max:50',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'support_email' => 'nullable|email|max:255',
            'facebook_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'youtube_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'whatsapp_number' => 'nullable|string|max:20',
            'about_text' => 'nullable|string',
            'founded_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'business_hours' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'additional_data' => 'nullable|json',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($companyInfo->logo_url) {
                Storage::disk('public')->delete($companyInfo->logo_url);
            }
            $path = $request->file('logo')->store('company', 'public');
            $validated['logo_url'] = $path;
        } else {
            unset($validated['logo_url']);
        }

        // Parse additional_data JSON if provided as string
        if (isset($validated['additional_data']) && is_string($validated['additional_data'])) {
            $validated['additional_data'] = json_decode($validated['additional_data'], true);
        }

        unset($validated['logo']); // Remove the file object

        $companyInfo->update($validated);

        return redirect()->route('company-info.index')->with('success', 'Company information updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $companyInfo = CompanyInfo::findOrFail($id);

        // Delete logo if exists
        if ($companyInfo->logo_url) {
            Storage::disk('public')->delete($companyInfo->logo_url);
        }

        $companyInfo->delete();

        return redirect()->route('company-info.index')->with('success', 'Company information deleted successfully.');
    }
}
