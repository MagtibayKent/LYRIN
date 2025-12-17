<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Translation Service
 * 
 * Handles translation with fallback support:
 * Primary: MyMemory API (free, no key required)
 * Fallback: LibreTranslate (self-hosted)
 */
class TranslationService
{
    /**
     * Request timeout in seconds
     */
    protected int $timeout = 10;

    /**
     * Cache TTL in seconds (1 hour)
     */
    protected int $cacheTtl = 3600;

    /**
     * MyMemory API endpoint
     */
    protected string $myMemoryUrl = 'https://api.mymemory.translated.net/get';

    /**
     * LibreTranslate API endpoint (from env)
     */
    protected string $libreTranslateUrl;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->libreTranslateUrl = config('services.libretranslate.url', 'http://localhost:5000');
        $this->timeout = config('services.translation.timeout', 10);
        $this->cacheTtl = config('services.translation.cache_ttl', 3600);
    }

    /**
     * Translate text with automatic fallback
     *
     * @param string $text Text to translate
     * @param string $source Source language code
     * @param string $target Target language code
     * @return array Translation result with provider info
     */
    public function translate(string $text, string $source, string $target): array
    {
        // Normalize language codes
        $sourceLang = $this->normalizeLanguageCode($source);
        $targetLang = $this->normalizeLanguageCode($target);

        // Same language - return original
        if ($sourceLang === $targetLang) {
            return [
                'success' => true,
                'translatedText' => $text,
                'provider' => 'none',
                'cached' => false,
            ];
        }

        // Check cache first
        $cacheKey = $this->getCacheKey($text, $sourceLang, $targetLang);
        $cached = Cache::get($cacheKey);
        
        if ($cached) {
            Log::info('Translation cache hit', [
                'source' => $sourceLang,
                'target' => $targetLang,
                'text_length' => strlen($text)
            ]);
            
            return [
                'success' => true,
                'translatedText' => $cached['text'],
                'provider' => $cached['provider'],
                'cached' => true,
            ];
        }

        // Try MyMemory first
        $result = $this->translateWithMyMemory($text, $sourceLang, $targetLang);
        
        if ($result['success']) {
            $this->cacheTranslation($cacheKey, $result['translatedText'], 'mymemory');
            return $result;
        }

        Log::warning('MyMemory translation failed, trying LibreTranslate', [
            'error' => $result['error'] ?? 'Unknown error',
            'source' => $sourceLang,
            'target' => $targetLang
        ]);

        // Fallback to LibreTranslate
        $result = $this->translateWithLibreTranslate($text, $sourceLang, $targetLang);
        
        if ($result['success']) {
            $this->cacheTranslation($cacheKey, $result['translatedText'], 'libretranslate');
            return $result;
        }

        Log::error('All translation providers failed', [
            'source' => $sourceLang,
            'target' => $targetLang,
            'text_length' => strlen($text)
        ]);

        return [
            'success' => false,
            'translatedText' => null,
            'provider' => 'none',
            'error' => 'All translation services are unavailable',
            'cached' => false,
        ];
    }

    /**
     * Translate using MyMemory API
     */
    protected function translateWithMyMemory(string $text, string $source, string $target): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->get($this->myMemoryUrl, [
                    'q' => $text,
                    'langpair' => "{$source}|{$target}"
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Check for valid response
                if (isset($data['responseStatus']) && $data['responseStatus'] === 200) {
                    if (isset($data['responseData']['translatedText'])) {
                        $translatedText = $data['responseData']['translatedText'];
                        
                        // Check if translation is valid (not an error message)
                        if (!$this->isErrorMessage($translatedText)) {
                            Log::info('MyMemory translation successful', [
                                'source' => $source,
                                'target' => $target,
                                'text_length' => strlen($text)
                            ]);

                            return [
                                'success' => true,
                                'translatedText' => $translatedText,
                                'provider' => 'mymemory',
                                'cached' => false,
                            ];
                        }
                    }
                }

                // API returned error status
                $errorMsg = $data['responseDetails'] ?? 'Unknown MyMemory error';
                return [
                    'success' => false,
                    'error' => $errorMsg,
                ];
            }

            return [
                'success' => false,
                'error' => 'MyMemory HTTP error: ' . $response->status(),
            ];

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return [
                'success' => false,
                'error' => 'MyMemory connection timeout',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'MyMemory exception: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Translate using LibreTranslate API
     */
    protected function translateWithLibreTranslate(string $text, string $source, string $target): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->libreTranslateUrl}/translate", [
                    'q' => $text,
                    'source' => $source,
                    'target' => $target,
                    'format' => 'text'
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['translatedText'])) {
                    Log::info('LibreTranslate translation successful', [
                        'source' => $source,
                        'target' => $target,
                        'text_length' => strlen($text)
                    ]);

                    return [
                        'success' => true,
                        'translatedText' => $data['translatedText'],
                        'provider' => 'libretranslate',
                        'cached' => false,
                    ];
                }

                return [
                    'success' => false,
                    'error' => $data['error'] ?? 'Invalid LibreTranslate response',
                ];
            }

            return [
                'success' => false,
                'error' => 'LibreTranslate HTTP error: ' . $response->status(),
            ];

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return [
                'success' => false,
                'error' => 'LibreTranslate connection failed (is it running?)',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'LibreTranslate exception: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Normalize language code for API compatibility
     */
    protected function normalizeLanguageCode(string $code): string
    {
        $map = [
            'fil' => 'tl',  // Filipino -> Tagalog for MyMemory
        ];

        return $map[strtolower($code)] ?? strtolower($code);
    }

    /**
     * Generate cache key for translation
     */
    protected function getCacheKey(string $text, string $source, string $target): string
    {
        return 'translation:' . md5("{$source}:{$target}:{$text}");
    }

    /**
     * Cache translation result
     */
    protected function cacheTranslation(string $key, string $text, string $provider): void
    {
        Cache::put($key, [
            'text' => $text,
            'provider' => $provider,
        ], $this->cacheTtl);
    }

    /**
     * Check if response is an error message
     */
    protected function isErrorMessage(string $text): bool
    {
        $errorPatterns = [
            'INVALID LANGUAGE PAIR',
            'QUERY LENGTH LIMIT',
            'MYMEMORY WARNING',
            'NO QUERY SPECIFIED',
        ];

        foreach ($errorPatterns as $pattern) {
            if (stripos($text, $pattern) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Clear translation cache
     */
    public function clearCache(): void
    {
        // Note: This clears ALL cache. For production, use tagged caching.
        Cache::flush();
        Log::info('Translation cache cleared');
    }
}
