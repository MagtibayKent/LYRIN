<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        try {
            $user = auth()->user();
            
            $quizHistory = $user->quizHistory()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($quiz) {
                    return [
                        'id' => $quiz->id,
                        'language' => $quiz->language,
                        'score' => $quiz->score,
                        'totalQuestions' => $quiz->total_questions,
                        'date' => $quiz->created_at->toISOString(),
                    ];
                });

            $dictionaryHistory = $user->dictionaryHistory()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($dict) {
                    return [
                        'id' => $dict->id,
                        'word' => $dict->word,
                        'language' => $dict->language,
                        'date' => $dict->created_at->toISOString(),
                    ];
                });

            // Get translation history (handle case where table might not exist yet)
            $translationHistory = [];
            try {
                $translationHistory = $user->translationHistory()
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($translation) {
                        return [
                            'id' => $translation->id,
                            'originalText' => $translation->original_text,
                            'translatedText' => $translation->translated_text,
                            'fromLanguage' => $translation->from_language,
                            'toLanguage' => $translation->to_language,
                            'date' => $translation->created_at->toISOString(),
                        ];
                    });
            } catch (\Exception $e) {
                // Table doesn't exist yet or other error - return empty array
                Log::warning('Translation history table not available: ' . $e->getMessage());
                $translationHistory = [];
            }

            // Calculate best single quiz score (not cumulative)
            // Each quiz has 10 questions, so best score is out of 10
            $bestQuiz = $user->quizHistory()
                ->orderByRaw('(score / total_questions) DESC')
                ->orderBy('score', 'DESC')
                ->first();
            
            $cumulativeBestScore = $bestQuiz ? $bestQuiz->score : 0;
            $totalPossibleScore = 10; // Always 10 since each quiz has 10 questions

            return Inertia::render('ProfilePage', [
                'quizHistory' => $quizHistory,
                'dictionaryHistory' => $dictionaryHistory,
                'translationHistory' => $translationHistory,
                'cumulativeBestScore' => $cumulativeBestScore,
                'totalPossibleScore' => $totalPossibleScore,
            ]);
        } catch (\Exception $e) {
            Log::error('Profile page error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('translator')->with('error', 'Unable to load profile. Please try again.');
        }
    }

    public function deleteQuiz($id)
    {
        try {
            $quiz = auth()->user()->quizHistory()->findOrFail($id);
            $quiz->delete();
            
            Log::info('Quiz history deleted', [
                'user_id' => auth()->id(),
                'quiz_id' => $id,
            ]);
            
            return redirect()->back()->with('message', 'Quiz history deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete quiz history: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'quiz_id' => $id,
            ]);

            return redirect()->back()->with('error', 'Failed to delete quiz history. Please try again.');
        }
    }

    public function deleteDictionary($id)
    {
        try {
            $dict = auth()->user()->dictionaryHistory()->findOrFail($id);
            $dict->delete();
            
            Log::info('Dictionary history deleted', [
                'user_id' => auth()->id(),
                'dict_id' => $id,
            ]);
            
            return redirect()->back()->with('message', 'Dictionary history deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete dictionary history: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'dict_id' => $id,
            ]);

            return redirect()->back()->with('error', 'Failed to delete dictionary history. Please try again.');
        }
    }

    public function clearAllQuizHistory()
    {
        try {
            $user = auth()->user();
            $deletedCount = \App\Models\QuizHistory::where('user_id', $user->id)->delete();
            
            Log::info('All quiz history cleared', [
                'user_id' => $user->id,
                'deleted_count' => $deletedCount,
            ]);
            
            return redirect()->route('profile')->with('message', 'All quiz history cleared successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to clear all quiz history: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('profile')->with('error', 'Failed to clear quiz history. Please try again.');
        }
    }

    public function clearAllDictionaryHistory()
    {
        try {
            $user = auth()->user();
            $deletedCount = \App\Models\DictionaryHistory::where('user_id', $user->id)->delete();
            
            Log::info('All dictionary history cleared', [
                'user_id' => $user->id,
                'deleted_count' => $deletedCount,
            ]);
            
            return redirect()->route('profile')->with('message', 'All dictionary search history cleared successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to clear all dictionary history: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('profile')->with('error', 'Failed to clear dictionary history. Please try again.');
        }
    }

    public function deleteTranslation($id)
    {
        try {
            $translation = auth()->user()->translationHistory()->findOrFail($id);
            $translation->delete();
            
            Log::info('Translation history deleted', [
                'user_id' => auth()->id(),
                'translation_id' => $id,
            ]);
            
            return redirect()->back()->with('message', 'Translation history deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete translation history: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'translation_id' => $id,
            ]);

            return redirect()->back()->with('error', 'Failed to delete translation history. Please try again.');
        }
    }

    public function clearAllTranslationHistory()
    {
        try {
            $user = auth()->user();
            $deletedCount = \App\Models\TranslationHistory::where('user_id', $user->id)->delete();
            
            Log::info('All translation history cleared', [
                'user_id' => $user->id,
                'deleted_count' => $deletedCount,
            ]);
            
            return redirect()->route('profile')->with('message', 'All translation history cleared successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to clear all translation history: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('profile')->with('error', 'Failed to clear translation history. Please try again.');
        }
    }
}

