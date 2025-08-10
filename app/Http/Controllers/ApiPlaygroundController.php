<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ApiPlaygroundController extends Controller
{
    /**
     * Display the API tester module.
     */
    public function index()
    {
        return Inertia::render('Admin/Api/Index');
    }
}


