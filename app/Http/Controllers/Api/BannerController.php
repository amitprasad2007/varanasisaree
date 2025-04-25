<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;

class BannerController extends Controller
{
    public function apiGetBanners()
    {
        $banners = Banner::active()->ordered()->get()->map(function ($banners) {
            return [
                'id' => $banners->id,
                'title' => $banners->title,
                'subtitle' => $banners->description,
                'description'=> $banners->description,
                'image' => asset('storage/' . $banners->image), // You'll need to handle image storage
                'cta' => $banners->slug,
                'path' => $banners->link,
            ];
        });
        ;
        return response()->json($banners);
    }
    public function apiGetheriBanner(){

        $banners = Banner::where('title','HeritageBanner')->active()->ordered()->get()->map(function ($banners) {
            return [
                'id' => $banners->id,
                'title' => $banners->title,
                'subtitle' => $banners->description,
                'description'=> $banners->description,
                'image' => asset('storage/' . $banners->image), // You'll need to handle image storage
                'cta' => $banners->slug,
                'path' => $banners->link,
            ];
        });
        ;
        return response()->json($banners);
    }
}
