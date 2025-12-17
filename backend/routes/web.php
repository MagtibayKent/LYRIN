<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group.
|
| Since this is an API-only backend, we only have minimal web routes.
|
*/

Route::get('/', function () {
    return response()->json([
        'name' => 'Lyrin Translator API',
        'version' => '1.0.0',
        'documentation' => url('/api/v1'),
        'health' => url('/api/health')
    ]);
});
