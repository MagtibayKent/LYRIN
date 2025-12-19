<?php

namespace App\Http\Controllers;

use App\Models\TranslationHistory;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class TranslatorController extends Controller
{
    protected TranslationService $translationService;

    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    public function index()
    {
        return Inertia::render('TranslatorPage');
    }

    public function translate(Request $request)
    {
        try {
            $validated = $request->validate([
                'text' => ['required', 'string', 'max:5000'],
                'from' => ['required', 'string', 'size:2'],
                'to' => ['required', 'string', 'size:2'],
            ]);

            $text = trim($validated['text']);
            $from = strtolower($validated['from']);
            $to = strtolower($validated['to']);

            // Use translation service with automatic fallback
            $result = $this->translationService->translate($text, $from, $to);

            // If translation failed
            if ($result['translated_text'] === null) {
                Log::error('Translation failed for both APIs', [
                    'from' => $from,
                    'to' => $to,
                    'error' => $result['error'],
                ]);

                return response()->json([
                    'error' => $result['error'] ?? 'Translation service is currently unavailable. Please try again later.',
                ], 503);
            }

            // Save to history if user is authenticated
            if (auth()->check()) {
                try {
                    // Check if table exists by attempting to query it
                    if (Schema::hasTable('translation_history')) {
                        // Prevent duplicate entries within a short period (e.g., 5 minutes)
                        $recentEntry = TranslationHistory::where('user_id', auth()->id())
                            ->where('original_text', $text)
                            ->where('translated_text', $result['translated_text'])
                            ->where('from_language', $from)
                            ->where('to_language', $to)
                            ->where('created_at', '>=', now()->subMinutes(5))
                            ->first();

                        if (!$recentEntry) {
                            TranslationHistory::create([
                                'user_id' => auth()->id(),
                                'original_text' => $text,
                                'translated_text' => $result['translated_text'],
                                'from_language' => $from,
                                'to_language' => $to,
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    // Silently fail - history saving shouldn't block the translation
                    Log::warning('Failed to save translation history: ' . $e->getMessage());
                }
            }

            // Success - return translation (don't expose which API was used)
            return response()->json([
                'translated' => $result['translated_text'],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Invalid request. Please check your input.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Translation controller error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred. Please try again later.',
            ], 500);
        }
    }
}

