<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DictionaryApiController;
use App\Http\Controllers\Api\QuizApiController;
use App\Http\Controllers\Api\LearningPreferenceController;


// ============================================================================
// Authentication Routes (Public & Protected)
// ============================================================================
Route::prefix('auth')->group(function () {
    // Public routes - no authentication required
    Route::post('/register', [AuthController::class, 'register']); // Register a new user account
    Route::post('/login', [AuthController::class, 'login']); // Login and receive Sanctum token
    
    // Protected routes - require Sanctum authentication
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']); // Logout and revoke current token
        Route::get('/me', [AuthController::class, 'me']); // Get current authenticated user's information
    });
});


// Protected API Routes (Require Sanctum Authentication)

Route::middleware('auth:sanctum')->group(function () {
    

    // Dictionary API Routes

    Route::prefix('dictionary')->group(function () {
        Route::post('/search', [DictionaryApiController::class, 'search']); // Search for word definitions
        Route::get('/history', [DictionaryApiController::class, 'getHistory']); // Get user's dictionary search history
        Route::get('/history/{id}/definition', [DictionaryApiController::class, 'viewDefinition']); // View specific definition from history
        Route::delete('/history/{id}', [DictionaryApiController::class, 'deleteHistory']); // Delete a specific history entry
    });


    // Quiz API Routes

    Route::prefix('quiz')->group(function () {
        Route::post('/submit', [QuizApiController::class, 'submit']); // Submit quiz results
        Route::get('/history', [QuizApiController::class, 'getHistory']); // Get user's quiz history
        Route::get('/history/{id}/details', [QuizApiController::class, 'viewDetails']); // Get detailed quiz results
        Route::delete('/history/{id}', [QuizApiController::class, 'deleteHistory']); // Delete a specific quiz history entry
        Route::get('/stats', [QuizApiController::class, 'getStats']); // Get user's quiz statistics (scores, averages, etc.)
    });

 
    // Learning Preferences API Routes

    Route::prefix('preferences')->group(function () {
        Route::get('/', [LearningPreferenceController::class, 'get']); // Get user's learning preferences
        Route::put('/', [LearningPreferenceController::class, 'update']); // Update user's learning preferences
        Route::delete('/', [LearningPreferenceController::class, 'delete']); // Delete user's learning preferences
    });


    // User Information Route

    Route::get('/user', function (Request $request) {
        // Return the currently authenticated user's information
        return $request->user();
    });
});

