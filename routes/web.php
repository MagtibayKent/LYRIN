<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\TranslatorController;
use App\Http\Controllers\DictionaryController;
use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Homepage');
})->name('home');

// Public routes (authentication pages only)
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
    Route::get('/signup', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/signup', [RegisterController::class, 'register']);
});

// Routes that require authentication
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
    
    Route::get('/translator', [TranslatorController::class, 'index'])->name('translator');
    Route::post('/translator/translate', [TranslatorController::class, 'translate'])->name('translator.translate')->middleware('throttle:20,1');
    
    Route::get('/dictionary', [DictionaryController::class, 'index'])->name('dictionary');
    Route::post('/dictionary/search', [DictionaryController::class, 'search'])->name('dictionary.search')->middleware('throttle:30,1');
    Route::post('/dictionary/history', [DictionaryController::class, 'saveHistory'])->name('dictionary.history.save');
    
    Route::get('/quizme', [QuizController::class, 'index'])->name('quizme');
    Route::get('/quiz/{language}/levels', [QuizController::class, 'showLevels'])->name('quiz.levels');
    Route::get('/quiz/{language}/{level}', [QuizController::class, 'show'])->name('quiz.show');
    Route::post('/quiz/{language}/{level}', [QuizController::class, 'submit'])->name('quiz.submit')->middleware('throttle:10,1');
    
    // Profile routes (already protected)
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    // Clear-all routes must come before parameterized routes to match correctly
    Route::delete('/profile/quiz/clear-all', [ProfileController::class, 'clearAllQuizHistory'])->name('profile.quiz.clear-all');
    Route::delete('/profile/quiz/{id}', [ProfileController::class, 'deleteQuiz'])->name('profile.quiz.delete');
    Route::delete('/profile/dictionary/clear-all', [ProfileController::class, 'clearAllDictionaryHistory'])->name('profile.dictionary.clear-all');
    Route::delete('/profile/dictionary/{id}', [ProfileController::class, 'deleteDictionary'])->name('profile.dictionary.delete');
    Route::delete('/profile/translation/clear-all', [ProfileController::class, 'clearAllTranslationHistory'])->name('profile.translation.clear-all');
    Route::delete('/profile/translation/{id}', [ProfileController::class, 'deleteTranslation'])->name('profile.translation.delete');
});

// Email Verification Routes (require authentication)
Route::middleware('auth')->group(function () {
    Route::get('/email/verify', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'show'])->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'verify'])->middleware('signed')->name('verification.verify');
    Route::post('/email/verification-notification', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'resend'])->name('verification.send');
});

