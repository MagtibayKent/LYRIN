<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DictionarySearch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;

class DictionaryController extends Controller
{
    /**
     * Search for a word in the dictionary
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        
        if (empty($query)) {
            return response()->json([
                'success' => false,
                'message' => 'Search query is required'
            ], 400);
        }

        // Try to get authenticated user from Bearer token
        $user = null;
        $token = $request->bearerToken();
        if ($token) {
            // Try to authenticate with sanctum
            $user = Auth::guard('sanctum')->user();
        }

        try {
            // Using Free Dictionary API
            $response = Http::get("https://api.dictionaryapi.dev/api/v2/entries/en/{$query}");
            
            if ($response->successful()) {
                $data = $response->json();
                
                // Format the response
                $results = [];
                $phonetic = null;
                foreach ($data as $entry) {
                    $meanings = [];
                    foreach ($entry['meanings'] ?? [] as $meaning) {
                        $definitions = [];
                        foreach ($meaning['definitions'] ?? [] as $def) {
                            $definitions[] = [
                                'definition' => $def['definition'] ?? '',
                                'example' => $def['example'] ?? null,
                                'synonyms' => $def['synonyms'] ?? [],
                            ];
                        }
                        $meanings[] = [
                            'partOfSpeech' => $meaning['partOfSpeech'] ?? '',
                            'definitions' => $definitions
                        ];
                    }
                    
                    $phonetic = $entry['phonetic'] ?? null;
                    $results[] = [
                        'word' => $entry['word'] ?? $query,
                        'phonetic' => $phonetic,
                        'phonetics' => $entry['phonetics'] ?? [],
                        'meanings' => $meanings,
                        'sourceUrls' => $entry['sourceUrls'] ?? []
                    ];
                }

                // Save search history if user is authenticated
                if ($user) {
                    DictionarySearch::create([
                        'user_id' => $user->id,
                        'word' => $query,
                        'phonetic' => $phonetic,
                        'found' => true,
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'data' => ['results' => $results]
                ]);
            }

            // Save failed search if user is authenticated
            if ($user) {
                DictionarySearch::create([
                    'user_id' => $user->id,
                    'word' => $query,
                    'phonetic' => null,
                    'found' => false,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Word not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dictionary service error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dictionary search history for authenticated user
     */
    public function getHistory(Request $request)
    {
        $user = $request->user();
        
        $history = DictionarySearch::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($search) {
                return [
                    'id' => $search->id,
                    'word' => $search->word,
                    'phonetic' => $search->phonetic,
                    'found' => $search->found,
                    'date' => $search->created_at->format('M d, Y'),
                    'time' => $search->created_at->format('h:i A'),
                ];
            });

        return response()->json([
            'success' => true,
            'history' => $history,
        ]);
    }

    /**
     * Clear all dictionary search history for authenticated user
     */
    public function clearHistory(Request $request)
    {
        $user = $request->user();
        
        $deleted = DictionarySearch::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Search history cleared successfully',
            'deleted_count' => $deleted,
        ]);
    }

    /**
     * Save a dictionary search to history (called from frontend after Wiktionary search)
     */
    public function saveHistory(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'word' => 'required|string|max:255',
            'phonetic' => 'nullable|string|max:255',
            'found' => 'required|boolean',
        ]);

        DictionarySearch::create([
            'user_id' => $user->id,
            'word' => $request->input('word'),
            'phonetic' => $request->input('phonetic'),
            'found' => $request->input('found'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Search saved to history',
        ]);
    }

    /**
     * Delete a single history item
     */
    public function deleteHistoryItem(Request $request, $id)
    {
        $user = $request->user();
        
        $search = DictionarySearch::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$search) {
            return response()->json([
                'success' => false,
                'message' => 'History item not found'
            ], 404);
        }
        
        $search->delete();

        return response()->json([
            'success' => true,
            'message' => 'History item deleted successfully',
        ]);
    }

    /**
     * Get detailed information about a specific word
     */
    public function getWord($word)
    {
        try {
            $response = Http::get("https://api.dictionaryapi.dev/api/v2/entries/en/{$word}");
            
            if ($response->successful()) {
                $data = $response->json();
                
                if (!empty($data)) {
                    $entry = $data[0];
                    
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'word' => $entry['word'] ?? $word,
                            'phonetic' => $entry['phonetic'] ?? null,
                            'phonetics' => $entry['phonetics'] ?? [],
                            'meanings' => $entry['meanings'] ?? [],
                            'license' => $entry['license'] ?? null,
                            'sourceUrls' => $entry['sourceUrls'] ?? []
                        ]
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Word not found in dictionary'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch word details'
            ], 500);
        }
    }
}
