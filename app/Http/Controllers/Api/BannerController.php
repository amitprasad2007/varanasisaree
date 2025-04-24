<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;

class BannerController extends Controller
{
    public function apiGetBanners()
    {
        $banners = Banner::active()->ordered()->get();
        return response()->json($banners);
    }
}
