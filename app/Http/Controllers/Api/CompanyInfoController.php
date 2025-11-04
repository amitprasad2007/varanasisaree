<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyInfo;
use Illuminate\Http\Request;

class CompanyInfoController extends Controller
{
    /**
     * Get company information
     * Returns the first (and usually only) company info record
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $companyInfo = CompanyInfo::first();

            if (!$companyInfo) {
                // Return default company info if not found
                return response()->json([
                    'success' => true,
                    'data' => [
                        'company_name' => 'Samar Silk Palace',
                        'gst_number' => '09AEWPF0981M1ZR',
                        'address' => 'N 12/381 - C BAJARDIHA DEV-POKHRI',
                        'city' => 'Varanasi',
                        'state' => 'Uttar Pradesh',
                        'country' => 'India',
                        'postal_code' => '221109',
                        'phone' => '+91 93056 26874',
                        'email' => 'samar@samarsilkpalace.com',
                        'support_email' => 'samar@samarsilkpalace.com',
                        'facebook_url' => 'https://www.facebook.com/samarsilkpalace',
                        'instagram_url' => 'https://www.instagram.com/samarsilkpalace',
                        'youtube_url' => 'https://www.youtube.com/@samarsilkpalace',
                        'twitter_url' => null,
                        'linkedin_url' => null,
                        'whatsapp_number' => '+919305626874',
                        'about_text' => 'Since 1985, we have been crafting exquisite Banarasi sarees and textiles.',
                        'founded_year' => '1985',
                        'business_hours' => 'Monday - Saturday: 10:00 AM - 6:00 PM IST',
                        'logo_url' => null,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'company_name' => $companyInfo->company_name,
                    'gst_number' => $companyInfo->gst_number,
                    'address' => $companyInfo->address,
                    'city' => $companyInfo->city,
                    'state' => $companyInfo->state,
                    'country' => $companyInfo->country,
                    'postal_code' => $companyInfo->postal_code,
                    'phone' => $companyInfo->phone,
                    'email' => $companyInfo->email,
                    'support_email' => $companyInfo->support_email,
                    'facebook_url' => $companyInfo->facebook_url,
                    'instagram_url' => $companyInfo->instagram_url,
                    'youtube_url' => $companyInfo->youtube_url,
                    'twitter_url' => $companyInfo->twitter_url,
                    'linkedin_url' => $companyInfo->linkedin_url,
                    'whatsapp_number' => $companyInfo->whatsapp_number,
                    'about_text' => $companyInfo->about_text,
                    'founded_year' => $companyInfo->founded_year,
                    'business_hours' => $companyInfo->business_hours,
                    'logo_url' => $companyInfo->logo_url,
                    'additional_data' => $companyInfo->additional_data,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch company information',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get contact information (subset of company info)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function contact()
    {
        try {
            $companyInfo = CompanyInfo::first();

            if (!$companyInfo) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'address' => 'N 12/381 - C BAJARDIHA DEV-POKHRI, Varanasi, Uttar Pradesh, India - 221109',
                        'phone' => '+91 93056 26874',
                        'email' => 'samar@samarsilkpalace.com',
                        'whatsapp_number' => '+919305626874',
                        'business_hours' => 'Monday - Saturday: 10:00 AM - 6:00 PM IST',
                    ],
                ]);
            }

            $fullAddress = trim(sprintf(
                '%s, %s, %s, %s - %s',
                $companyInfo->address,
                $companyInfo->city,
                $companyInfo->state,
                $companyInfo->country,
                $companyInfo->postal_code
            ));

            return response()->json([
                'success' => true,
                'data' => [
                    'address' => $fullAddress,
                    'phone' => $companyInfo->phone,
                    'email' => $companyInfo->email,
                    'support_email' => $companyInfo->support_email,
                    'whatsapp_number' => $companyInfo->whatsapp_number,
                    'business_hours' => $companyInfo->business_hours,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch contact information',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get social media links
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function social()
    {
        try {
            $companyInfo = CompanyInfo::first();

            if (!$companyInfo) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'facebook' => 'https://www.facebook.com/samarsilkpalace',
                        'instagram' => 'https://www.instagram.com/samarsilkpalace',
                        'youtube' => 'https://www.youtube.com/@samarsilkpalace',
                        'twitter' => null,
                        'linkedin' => null,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'facebook' => $companyInfo->facebook_url,
                    'instagram' => $companyInfo->instagram_url,
                    'youtube' => $companyInfo->youtube_url,
                    'twitter' => $companyInfo->twitter_url,
                    'linkedin' => $companyInfo->linkedin_url,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch social media links',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
