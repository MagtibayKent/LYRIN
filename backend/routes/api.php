<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TranslationController;
use App\Http\Controllers\Api\DictionaryController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\LearningController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// Public routes
Route::prefix('v1')->group(function () {
    
    // Authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Translation routes (public)
    Route::post('/translate', [TranslationController::class, 'translate']);
    Route::get('/languages', [TranslationController::class, 'getLanguages']);
    
    // Dictionary routes (public - auth handled in controller)
    Route::get('/dictionary/search', [DictionaryController::class, 'search']);
    Route::get('/dictionary/word/{word}', [DictionaryController::class, 'getWord']);
    
    // Learning routes (public)
    Route::get('/learning/phrases', [LearningController::class, 'getPhrases']);
    Route::get('/learning/categories', [LearningController::class, 'getCategories']);
    
    // Quiz routes (public - read only)
    Route::get('/quiz/questions', [QuizController::class, 'getQuestions']);
    
    // Protected routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        
        // User routes
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/user/profile', [AuthController::class, 'updateProfile']);
        
        // Translation history (protected)
        Route::get('/translations/history', [TranslationController::class, 'getHistory']);
        Route::post('/translations/save', [TranslationController::class, 'saveTranslation']);
        Route::delete('/translations/{id}', [TranslationController::class, 'deleteTranslation']);
        
        // Dictionary search history (protected)
        Route::get('/dictionary/history', [DictionaryController::class, 'getHistory']);
        Route::post('/dictionary/history', [DictionaryController::class, 'saveHistory']);
        Route::delete('/dictionary/history', [DictionaryController::class, 'clearHistory']);
        Route::delete('/dictionary/history/{id}', [DictionaryController::class, 'deleteHistoryItem']);
        
        // Quiz score tracking (protected)
        Route::post('/quiz/submit', [QuizController::class, 'submitQuiz']);
        Route::get('/quiz/scores', [QuizController::class, 'getScores']);
        
        // Learning progress (protected)
        Route::get('/learning/progress', [LearningController::class, 'getProgress']);
        Route::post('/learning/progress', [LearningController::class, 'updateProgress']);
    });
});

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Lyrin API is running',
        'timestamp' => now()->toISOString()
    ]);
});
