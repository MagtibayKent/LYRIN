<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Translation;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class TranslationController extends Controller
{
    /**
     * Translation service instance
     */
    protected TranslationService $translationService;

    /**
     * Constructor - inject translation service
     */
    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Supported languages
     */
    protected $languages = [
        'en' => 'English',
        'tl' => 'Filipino',
        'fil' => 'Filipino',
        'es' => 'Spanish',
        'fr' => 'French',
        'de' => 'German',
        'it' => 'Italian',
        'pt' => 'Portuguese',
        'ja' => 'Japanese',
        'ko' => 'Korean',
        'zh' => 'Chinese',
        'ru' => 'Russian',
        'ar' => 'Arabic',
        'hi' => 'Hindi',
        'id' => 'Indonesian',
        'th' => 'Thai',
        'vi' => 'Vietnamese',
        'nl' => 'Dutch',
        'el' => 'Greek',
        'tr' => 'Turkish',
        'sv' => 'Swedish'
    ];

    /**
     * Get list of supported languages
     */
    public function getLanguages()
    {
        $formattedLanguages = [];
        foreach ($this->languages as $code => $name) {
            // Skip duplicate 'fil' entry
            if ($code === 'fil') continue;
            
            $formattedLanguages[] = [
                'code' => $code === 'tl' ? 'fil' : $code,
                'name' => $name
            ];
        }

        return response()->json([
            'success' => true,
            'data' => ['languages' => $formattedLanguages]
        ]);
    }

    /**
     * Translate text using MyMemory API with LibreTranslate fallback
     */
    public function translate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'text' => ['required', 'string', 'max:5000'],
            'source' => ['required', 'string', 'max:5'],
            'target' => ['required', 'string', 'max:5'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $text = $request->text;
        $sourceLang = $request->source;
        $targetLang = $request->target;

        // Use translation service with automatic fallback
        $result = $this->translationService->translate($text, $sourceLang, $targetLang);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'data' => [
                    'original' => $text,
                    'translated' => $result['translatedText'],
                    'source' => $sourceLang,
                    'target' => $targetLang,
                    'provider' => $result['provider'],
                    'cached' => $result['cached'] ?? false,
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['error'] ?? 'Translation service unavailable'
        ], 503);
    }

    /**
     * Save translation to history (authenticated users only)
     */
    public function saveTranslation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'original_text' => ['required', 'string'],
            'translated_text' => ['required', 'string'],
            'source_language' => ['required', 'string'],
            'target_language' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $translation = Translation::create([
            'user_id' => $request->user()->id,
            'original_text' => $request->original_text,
            'translated_text' => $request->translated_text,
            'source_language' => $request->source_language,
            'target_language' => $request->target_language,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Translation saved',
            'data' => ['translation' => $translation]
        ], 201);
    }

    /**
     * Get translation history (authenticated users only)
     */
    public function getHistory(Request $request)
    {
        $translations = Translation::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $translations
        ]);
    }

    /**
     * Delete a translation from history
     */
    public function deleteTranslation(Request $request, $id)
    {
        $translation = Translation::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$translation) {
            return response()->json([
                'success' => false,
                'message' => 'Translation not found'
            ], 404);
        }

        $translation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Translation deleted'
        ]);
    }
}
