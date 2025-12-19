<?php

namespace App\Http\Controllers;

use App\Models\QuizHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index()
    {
        $bestScore = 0;
        
        // Calculate best score for authenticated users
        if (auth()->check()) {
            $bestScore = auth()->user()->quizHistory()->sum('score');
        }
        
        return Inertia::render('QuizMePage', [
            'bestScore' => $bestScore,
        ]);
    }

    public function showLevels($language)
    {
        return Inertia::render('QuizLevelsPage', [
            'language' => $language,
        ]);
    }

    public function show($language, $level = 1)
    {
        // Validate level is between 1-6
        $level = max(1, min(6, (int)$level));
        
        return Inertia::render('QuizPage', [
            'language' => $language,
            'level' => $level,
        ]);
    }

    public function submit(Request $request, $language, $level = 1)
    {
        try {
            $validated = $request->validate([
                'score' => ['required', 'integer', 'min:0'],
                'totalQuestions' => ['required', 'integer', 'min:1'],
            ]);

            // Validate level
            $level = max(1, min(6, (int)$level));

            // Only save quiz history for authenticated users
            if (auth()->check()) {
                try {
                    QuizHistory::create([
                        'user_id' => auth()->id(),
                        'language' => $language,
                        'level' => $level,
                        'score' => $validated['score'],
                        'total_questions' => $validated['totalQuestions'],
                    ]);

                    Log::info('Quiz completed and saved', [
                        'user_id' => auth()->id(),
                        'language' => $language,
                        'score' => $validated['score'],
                    ]);

                    // Return to quiz page without redirecting - preserves component state so completion screen stays visible
                    return Inertia::render('QuizPage', [
                        'language' => $language,
                        'level' => $level,
                    ])->with('message', 'Quiz completed and saved!');
                } catch (\Exception $e) {
                    Log::error('Failed to save quiz history: ' . $e->getMessage(), [
                        'user_id' => auth()->id(),
                        'language' => $language,
                    ]);

                    return redirect()->route('quiz.show', ['language' => $language, 'level' => $level])
                        ->with('message', 'Quiz completed! However, we couldn\'t save your results. Please try again.');
                }
            } else {
                // For guests, just redirect back to quiz page with success message
                Log::info('Guest completed quiz', [
                    'language' => $language,
                    'score' => $validated['score'],
                ]);

                return redirect()->route('quiz.show', ['language' => $language, 'level' => $level])
                    ->with('message', 'Quiz completed! Sign up to save your results.');
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Quiz submission error: ' . $e->getMessage(), [
                'language' => $language,
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('quiz.show', ['language' => $language, 'level' => $level])
                ->with('error', 'An error occurred. Please try again.');
        }
    }
}

