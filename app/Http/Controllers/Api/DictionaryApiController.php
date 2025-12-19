<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DictionaryHistory;
use App\Models\DictionaryDefinition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class DictionaryApiController extends Controller
{
    public function search(Request $request)
    {
        try {
            $validated = $request->validate([
                'word' => ['required', 'string'],
                'language' => ['required', 'string'],
            ]);

            $word = strtolower(trim($validated['word']));
            $language = strtolower(trim($validated['language']));

            $definition = DictionaryDefinition::where('word', $word)
                ->where('language', $language)
                ->first();

            if (!$definition) {
                try {
                    $response = Http::timeout(10)
                        ->withoutVerifying()
                        ->get("https://api.dictionaryapi.dev/api/v2/entries/{$language}/{$word}");
                    
                    if ($response->successful()) {
                        $data = $response->json();
                        if (is_array($data) && count($data) > 0) {
                            $definition = DictionaryDefinition::create([
                                'word' => $word,
                                'language' => $language,
                                'definition_data' => $data,
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Dictionary API error: ' . $e->getMessage());
                }
            }

            if ($definition) {
                if ($request->user()) {
                    DictionaryHistory::create([
                        'user_id' => $request->user()->id,
                        'definition_id' => $definition->id,
                        'word' => $word,
                        'language' => $language,
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Word found successfully',
                    'data' => $definition->definition_data,
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Word not found in the selected language dictionary',
                ], 404);
            }
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Dictionary search error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch word definition',
            ], 500);
        }
    }

    public function getHistory(Request $request)
    {
        try {
            $history = $request->user()
                ->dictionaryHistory()
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $history,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get dictionary history error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve history',
            ], 500);
        }
    }

    public function deleteHistory(Request $request, $id)
    {
        try {
            $history = $request->user()->dictionaryHistory()->findOrFail($id);
            $history->delete();

            return response()->json([
                'success' => true,
                'message' => 'Dictionary history deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete dictionary history error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete history',
            ], 500);
        }
    }

    public function viewDefinition(Request $request, $id)
    {
        try {
            $history = $request->user()->dictionaryHistory()->with('definition')->findOrFail($id);

            if (!$history->definition) {
                return response()->json([
                    'success' => false,
                    'message' => 'Definition not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'word' => $history->word,
                    'language' => $history->language,
                    'searched_at' => $history->created_at,
                    'definition' => $history->definition->definition_data,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('View definition error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve definition',
            ], 500);
        }
    }
}
