<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TranslationService
{
    /**
     * Primary translation API
     */
    private const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
    
    /**
     * Backup translation API
     */
    private const LIBRETRANSLATE_URL = 'https://libretranslate.com/translate';

    /**
     * Translate text from source language to target language.
     * 
     * @param string $text
     * @param string $from Source language code (e.g., 'en')
     * @param string $to Target language code (e.g., 'fr')
     * @return array{translated_text: string|null, source: string, error: string|null}
     */
    public function translate(string $text, string $from, string $to): array
    {
        // Validate input
        $text = trim($text);
        if (empty($text)) {
            return [
                'translated_text' => null,
                'source' => 'none',
                'error' => 'Text cannot be empty.',
            ];
        }

        // Validate language codes
        $from = strtolower($from);
        $to = strtolower($to);

        if ($from === $to) {
            return [
                'translated_text' => $text,
                'source' => 'none',
                'error' => null,
            ];
        }

        // Try MyMemory API first (primary)
        $result = $this->translateWithMyMemory($text, $from, $to);
        
        if ($result['translated_text'] !== null) {
            return $result;
        }

        // Fallback to LibreTranslate if MyMemory failed
        Log::info('MyMemory translation failed, falling back to LibreTranslate', [
            'from' => $from,
            'to' => $to,
            'error' => $result['error'],
        ]);

        $result = $this->translateWithLibreTranslate($text, $from, $to);
        
        return $result;
    }

    /**
     * Translate using MyMemory API (Primary)
     */
    private function translateWithMyMemory(string $text, string $from, string $to): array
    {
        try {
            // Check cache first (24 hours)
            $cacheKey = "mymemory_{$from}_{$to}_" . md5($text);
            $cached = Cache::get($cacheKey);
            
            if ($cached !== null) {
                return [
                    'translated_text' => $cached,
                    'source' => 'mymemory',
                    'error' => null,
                ];
            }

            $response = Http::timeout(10)
                ->withoutVerifying() // Disable SSL verification (development)
                ->get(self::MYMEMORY_URL, [
                    'q' => $text,
                    'langpair' => "{$from}|{$to}",
                ]);

            // Check HTTP status
            if (!$response->successful()) {
                return [
                    'translated_text' => null,
                    'source' => 'mymemory',
                    'error' => 'MyMemory API request failed.',
                ];
            }

            $data = $response->json();

            // Check for rate limit or quota issues
            if (isset($data['responseStatus']) && $data['responseStatus'] !== 200) {
                Log::warning('MyMemory API error response', [
                    'status' => $data['responseStatus'],
                    'data' => $data,
                ]);
                
                return [
                    'translated_text' => null,
                    'source' => 'mymemory',
                    'error' => 'MyMemory API quota or rate limit exceeded.',
                ];
            }

            // Check for translated text
            if (!isset($data['responseData']['translatedText']) || empty(trim($data['responseData']['translatedText']))) {
                return [
                    'translated_text' => null,
                    'source' => 'mymemory',
                    'error' => 'MyMemory API returned empty translation.',
                ];
            }

            $translated = trim($data['responseData']['translatedText']);

            // Don't return if translation is the same as input (likely error)
            if ($translated === $text && strlen($text) > 3) {
                return [
                    'translated_text' => null,
                    'source' => 'mymemory',
                    'error' => 'MyMemory API returned invalid translation.',
                ];
            }

            // Cache successful translation
            Cache::put($cacheKey, $translated, 86400);

            return [
                'translated_text' => $translated,
                'source' => 'mymemory',
                'error' => null,
            ];

        } catch (\Exception $e) {
            Log::error('MyMemory translation error', [
                'error' => $e->getMessage(),
                'from' => $from,
                'to' => $to,
            ]);

            return [
                'translated_text' => null,
                'source' => 'mymemory',
                'error' => 'MyMemory API request failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Translate using LibreTranslate API (Backup)
     */
    private function translateWithLibreTranslate(string $text, string $from, string $to): array
    {
        try {
            // Check cache first (24 hours)
            $cacheKey = "libretranslate_{$from}_{$to}_" . md5($text);
            $cached = Cache::get($cacheKey);
            
            if ($cached !== null) {
                return [
                    'translated_text' => $cached,
                    'source' => 'libre',
                    'error' => null,
                ];
            }

            $response = Http::timeout(15)
                ->withoutVerifying() // Disable SSL verification for LibreTranslate (development)
                ->post(self::LIBRETRANSLATE_URL, [
                    'q' => $text,
                    'source' => $from,
                    'target' => $to,
                    'format' => 'text',
                ]);

            // Check HTTP status
            if (!$response->successful()) {
                Log::warning('LibreTranslate API request failed', [
                    'status' => $response->status(),
                    'from' => $from,
                    'to' => $to,
                ]);

                return [
                    'translated_text' => null,
                    'source' => 'libre',
                    'error' => 'LibreTranslate API request failed.',
                ];
            }

            $data = $response->json();

            // Check for translated text
            if (!isset($data['translatedText']) || empty(trim($data['translatedText']))) {
                return [
                    'translated_text' => null,
                    'source' => 'libre',
                    'error' => 'LibreTranslate API returned empty translation.',
                ];
            }

            $translated = trim($data['translatedText']);

            // Don't return if translation is the same as input (likely error)
            if ($translated === $text && strlen($text) > 3) {
                return [
                    'translated_text' => null,
                    'source' => 'libre',
                    'error' => 'LibreTranslate API returned invalid translation.',
                ];
            }

            // Cache successful translation
            Cache::put($cacheKey, $translated, 86400);

            Log::info('LibreTranslate backup translation successful', [
                'from' => $from,
                'to' => $to,
            ]);

            return [
                'translated_text' => $translated,
                'source' => 'libre',
                'error' => null,
            ];

        } catch (\Exception $e) {
            Log::error('LibreTranslate translation error', [
                'error' => $e->getMessage(),
                'from' => $from,
                'to' => $to,
            ]);

            return [
                'translated_text' => null,
                'source' => 'libre',
                'error' => 'LibreTranslate API request failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get supported languages
     */
    public function getSupportedLanguages(): array
    {
        return [
            'en' => 'English',
            'fr' => 'French',
            'es' => 'Spanish',
            'de' => 'German',
            'it' => 'Italian',
            'pt' => 'Portuguese',
            'ru' => 'Russian',
            'ja' => 'Japanese',
            'zh' => 'Chinese',
            'hi' => 'Hindi',
            'ar' => 'Arabic',
            'ko' => 'Korean',
            'nl' => 'Dutch',
            'pl' => 'Polish',
        ];
    }
}

