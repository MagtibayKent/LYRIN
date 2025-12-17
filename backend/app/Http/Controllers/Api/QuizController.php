<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuizScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuizController extends Controller
{
    /**
     * Sample quiz questions
     */
    protected $questions = [
        [
            'id' => 1,
            'question' => 'Translate: "Hello"',
            'options' => ['Paalam', 'Kumusta', 'Salamat', 'Oo'],
            'correct' => 1, // Index of correct answer
            'category' => 'greetings'
        ],
        [
            'id' => 2,
            'question' => 'Translate: "Thank you"',
            'options' => ['Paalam', 'Salamat', 'Kumusta', 'Hindi'],
            'correct' => 1,
            'category' => 'common_phrases'
        ],
        [
            'id' => 3,
            'question' => 'Translate: "Good morning"',
            'options' => ['Magandang umaga', 'Magandang gabi', 'Magandang hapon', 'Magandang araw'],
            'correct' => 0,
            'category' => 'greetings'
        ],
        [
            'id' => 4,
            'question' => 'What does "Paalam" mean?',
            'options' => ['Hello', 'Thank you', 'Goodbye', 'Please'],
            'correct' => 2,
            'category' => 'greetings'
        ],
        [
            'id' => 5,
            'question' => 'Translate: "How are you?"',
            'options' => ['Ano ang pangalan mo?', 'Kumusta ka?', 'Saan ka pupunta?', 'Anong oras na?'],
            'correct' => 1,
            'category' => 'greetings'
        ],
        [
            'id' => 6,
            'question' => 'What is "One" in Filipino?',
            'options' => ['Dalawa', 'Tatlo', 'Isa', 'Apat'],
            'correct' => 2,
            'category' => 'numbers'
        ],
        [
            'id' => 7,
            'question' => 'What is "Three" in Filipino?',
            'options' => ['Isa', 'Dalawa', 'Tatlo', 'Lima'],
            'correct' => 2,
            'category' => 'numbers'
        ],
        [
            'id' => 8,
            'question' => 'Translate: "Good evening"',
            'options' => ['Magandang umaga', 'Magandang hapon', 'Magandang gabi', 'Magandang tanghali'],
            'correct' => 2,
            'category' => 'greetings'
        ],
        [
            'id' => 9,
            'question' => 'What does "Oo" mean?',
            'options' => ['No', 'Yes', 'Maybe', 'Please'],
            'correct' => 1,
            'category' => 'common_phrases'
        ],
        [
            'id' => 10,
            'question' => 'Translate: "I love you"',
            'options' => ['Mahal kita', 'Gusto kita', 'Miss na kita', 'Salamat sa iyo'],
            'correct' => 0,
            'category' => 'expressions'
        ]
    ];

    /**
     * Get quiz questions
     */
    public function getQuestions(Request $request)
    {
        $category = $request->input('category');
        $limit = $request->input('limit', 5);

        $questions = collect($this->questions);

        if ($category) {
            $questions = $questions->where('category', $category);
        }

        // Remove correct answers from public response
        $publicQuestions = $questions->take($limit)->map(function ($q) {
            return [
                'id' => $q['id'],
                'question' => $q['question'],
                'options' => $q['options'],
                'category' => $q['category']
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'questions' => $publicQuestions,
                'total' => count($this->questions)
            ]
        ]);
    }

    /**
     * Submit quiz answers and get score
     * Now accepts language and direct score data from frontend
     */
    public function submitQuiz(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'language' => ['required', 'string'],
            'score' => ['required', 'integer', 'min:0'],
            'total' => ['required', 'integer', 'min:1'],
            'percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Save score if user is authenticated
        if ($request->user()) {
            $quizScore = QuizScore::create([
                'user_id' => $request->user()->id,
                'language' => $request->language,
                'score' => $request->score,
                'total' => $request->total,
                'percentage' => $request->percentage
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quiz score saved successfully',
                'data' => [
                    'id' => $quizScore->id,
                    'language' => $quizScore->language,
                    'score' => $quizScore->score,
                    'total' => $quizScore->total,
                    'percentage' => $quizScore->percentage,
                    'created_at' => $quizScore->created_at
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'User not authenticated'
        ], 401);
    }

    /**
     * Get user's quiz scores
     */
    public function getScores(Request $request)
    {
        $scores = QuizScore::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($score) {
                return [
                    'id' => $score->id,
                    'language' => $score->language,
                    'score' => $score->score,
                    'total' => $score->total,
                    'percentage' => $score->percentage,
                    'created_at' => $score->created_at->format('M d, Y h:i A'),
                    'date' => $score->created_at->format('M d, Y'),
                ];
            });

        return response()->json([
            'success' => true,
            'scores' => $scores
        ]);
    }
}
