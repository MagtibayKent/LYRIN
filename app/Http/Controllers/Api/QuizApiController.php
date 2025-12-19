<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuizHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class QuizApiController extends Controller
{
    public function submit(Request $request)
    {
        try {
            $validated = $request->validate([
                'language' => ['required', 'string'],
                'score' => ['required', 'integer', 'min:0'],
                'total_questions' => ['required', 'integer', 'min:1'],
            ]);

            $quiz = QuizHistory::create([
                'user_id' => $request->user()->id,
                'language' => $validated['language'],
                'score' => $validated['score'],
                'total_questions' => $validated['total_questions'],
            ]);

            Log::info('Quiz submitted via API', [
                'user_id' => $request->user()->id,
                'quiz_id' => $quiz->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quiz submitted successfully',
                'data' => [
                    'id' => $quiz->id,
                    'language' => $quiz->language,
                    'score' => $quiz->score,
                    'total_questions' => $quiz->total_questions,
                    'percentage' => round(($quiz->score / $quiz->total_questions) * 100, 2),
                    'created_at' => $quiz->created_at,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Quiz submission error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit quiz',
            ], 500);
        }
    }

    public function getHistory(Request $request)
    {
        try {
            $history = $request->user()
                ->quizHistory()
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $history,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get quiz history error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve history',
            ], 500);
        }
    }

    public function deleteHistory(Request $request, $id)
    {
        try {
            $history = $request->user()->quizHistory()->findOrFail($id);
            $history->delete();

            return response()->json([
                'success' => true,
                'message' => 'Quiz history deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete quiz history error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete history',
            ], 500);
        }
    }

    public function getStats(Request $request)
    {
        try {
            $user = $request->user();
            $quizHistory = $user->quizHistory;

            $totalQuizzes = $quizHistory->count();
            $averageScore = $totalQuizzes > 0 
                ? $quizHistory->avg(function ($quiz) {
                    return ($quiz->score / $quiz->total_questions) * 100;
                })
                : 0;

            $languageStats = $quizHistory->groupBy('language')->map(function ($quizzes, $language) {
                $count = $quizzes->count();
                $avgScore = $quizzes->avg(function ($quiz) {
                    return ($quiz->score / $quiz->total_questions) * 100;
                });

                return [
                    'language' => $language,
                    'count' => $count,
                    'average_score' => round($avgScore, 2),
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_quizzes' => $totalQuizzes,
                    'average_score' => round($averageScore, 2),
                    'language_stats' => $languageStats,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get quiz stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve stats',
            ], 500);
        }
    }

    public function viewDetails(Request $request, $id)
    {
        try {
            $quiz = $request->user()->quizHistory()->findOrFail($id);

            $percentage = round(($quiz->score / $quiz->total_questions) * 100, 2);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $quiz->id,
                    'language' => $quiz->language,
                    'level' => $quiz->level ?? 1,
                    'score' => $quiz->score,
                    'total_questions' => $quiz->total_questions,
                    'percentage' => $percentage,
                    'grade' => $this->getGrade($percentage),
                    'completed_at' => $quiz->created_at,
                    'formatted_date' => $quiz->created_at->format('M d, Y, h:i A'),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('View quiz details error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve quiz details',
            ], 500);
        }
    }

    private function getGrade($percentage)
    {
        if ($percentage >= 90) return 'A';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 60) return 'D';
        return 'F';
    }
}
