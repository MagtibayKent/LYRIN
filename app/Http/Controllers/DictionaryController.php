<?php

namespace App\Http\Controllers;

use App\Models\DictionaryHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DictionaryController extends Controller
{
    public function index()
    {
        return Inertia::render('DictionaryPage');
    }

    public function search(Request $request)
    {
        $validated = $request->validate([
            'word' => ['required', 'string'],
            'language' => ['required', 'string'],
        ]);

        $word = strtolower(trim($validated['word']));
        $language = strtolower(trim($validated['language']));

        // Cache key for this search
        $cacheKey = "dictionary_{$language}_{$word}";
        
        // Check cache first (cache for 7 days)
        $cachedResult = Cache::remember($cacheKey, 604800, function () use ($word, $language) {
            try {
                // Call the Free Dictionary API
                $response = Http::timeout(10)
                    ->withoutVerifying() // Disable SSL verification (development)
                    ->get("https://freedictionaryapi.com/api/v1/entries/{$language}/{$word}");
                
                // Log the response for debugging
                Log::info('Dictionary API Response', [
                    'word' => $word,
                    'language' => $language,
                    'status' => $response->status(),
                    'successful' => $response->successful(),
                    'url' => "https://freedictionaryapi.com/api/v1/entries/{$language}/{$word}",
                ]);
                
                if ($response->successful()) {
                    $data = $response->json();
                    
                    // Log the raw response for debugging (first 500 chars)
                    $rawData = json_encode($data);
                    Log::info('Dictionary API Raw Response', [
                        'raw_data_preview' => substr($rawData, 0, 500),
                        'is_array' => is_array($data),
                        'is_object' => is_object($data),
                        'has_word' => isset($data['word']) || (is_object($data) && isset($data->word)),
                        'entries_count' => isset($data['entries']) ? (is_array($data['entries']) ? count($data['entries']) : 'not_array') : 'not_set',
                        'meanings_count' => isset($data['meanings']) ? (is_array($data['meanings']) ? count($data['meanings']) : 'not_array') : 'not_set',
                    ]);
                    
                    // Free Dictionary API can return either an object or an array
                    if (is_array($data)) {
                        // If it's an array, return the first entry if it has a word
                        if (count($data) > 0) {
                            $entry = $data[0];
                            // Return entry if it has a word property, even if entries is empty
                            if (isset($entry['word']) || (is_object($entry) && isset($entry->word))) {
                                return is_array($entry) ? $entry : (array) $entry;
                            }
                        }
                    } elseif (is_object($data)) {
                        // Convert object to array for consistent handling
                        $entry = (array) $data;
                        // Return if it has a word property, even if entries is empty
                        if (isset($entry['word'])) {
                            return $entry;
                        }
                    } elseif (is_array($data) && isset($data['word'])) {
                        // If it's an associative array with word key, return it
                        return $data;
                    }
                } elseif ($response->status() === 404) {
                    // Explicitly handle 404 - word not found
                    Log::info('Word not found in dictionary', [
                        'word' => $word,
                        'language' => $language,
                    ]);
                    return null;
                } else {
                    // Log other error statuses
                    Log::warning('Dictionary API returned error status', [
                        'word' => $word,
                        'language' => $language,
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
                
                return null;
            } catch (\Exception $e) {
                Log::error('Dictionary API error: ' . $e->getMessage(), [
                    'word' => $word,
                    'language' => $language,
                    'trace' => $e->getTraceAsString(),
                ]);
                return null;
            }
        });

        try {
            if ($cachedResult) {
                $data = $cachedResult;

                // Save to history only if user is authenticated
                if (auth()->check()) {
                    try {
                        DictionaryHistory::create([
                            'user_id' => auth()->id(),
                            'word' => $word,
                            'language' => $language,
                        ]);
                    } catch (\Exception $e) {
                        Log::warning('Failed to save dictionary history: ' . $e->getMessage());
                    }
                }

                return back()->with([
                    'dictionaryResult' => [$data], // Wrap in array for consistency
                    'message' => 'Word found successfully!',
                ]);
            } else {
                // Word not found in cache or API
                return back()->withErrors([
                    'word' => 'Word not found in the selected language dictionary. Please try a different language or check the spelling.',
                ])->with([
                    'dictionaryResult' => null,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Dictionary search error: ' . $e->getMessage(), [
                'word' => $word,
                'language' => $language,
                'trace' => $e->getTraceAsString(),
            ]);
            
            return back()->withErrors([
                'word' => 'Unable to fetch word definition. Please try again later.',
            ])->with([
                'dictionaryResult' => null,
            ]);
        }
    }

    /**
     * Save dictionary search to history
     */
    public function saveHistory(Request $request)
    {
        try {
            $validated = $request->validate([
                'word' => ['required', 'string'],
                'language' => ['required', 'string'],
            ]);

            $word = strtolower(trim($validated['word']));
            $language = strtolower(trim($validated['language']));

            // Save to history only if user is authenticated
            if (auth()->check()) {
                try {
                    // Check if this exact search already exists (avoid duplicates)
                    $existing = DictionaryHistory::where('user_id', auth()->id())
                        ->where('word', $word)
                        ->where('language', $language)
                        ->where('created_at', '>=', now()->subMinutes(5)) // Within last 5 minutes
                        ->first();

                    if (!$existing) {
                        DictionaryHistory::create([
                            'user_id' => auth()->id(),
                            'word' => $word,
                            'language' => $language,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to save dictionary history: ' . $e->getMessage());
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Dictionary history save error: ' . $e->getMessage());
            return response()->json(['success' => false], 500);
        }
    }
}

