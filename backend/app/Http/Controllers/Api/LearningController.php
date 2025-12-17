<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LearningController extends Controller
{
    /**
     * Learning phrases organized by category
     */
    protected $phrases = [
        'common_phrases' => [
            'title' => 'Common Phrases',
            'items' => [
                ['english' => 'Hello', 'filipino' => 'Kumusta'],
                ['english' => 'Thank you', 'filipino' => 'Salamat'],
                ['english' => 'Please', 'filipino' => 'Pakiusap'],
                ['english' => 'Yes', 'filipino' => 'Oo'],
                ['english' => 'No', 'filipino' => 'Hindi'],
                ['english' => 'Excuse me', 'filipino' => 'Paumanhin'],
                ['english' => 'Sorry', 'filipino' => 'Pasensya na'],
                ['english' => 'Goodbye', 'filipino' => 'Paalam'],
            ]
        ],
        'greetings' => [
            'title' => 'Greetings',
            'items' => [
                ['english' => 'Good morning', 'filipino' => 'Magandang umaga'],
                ['english' => 'Good afternoon', 'filipino' => 'Magandang hapon'],
                ['english' => 'Good evening', 'filipino' => 'Magandang gabi'],
                ['english' => 'Good night', 'filipino' => 'Magandang gabi'],
                ['english' => 'How are you?', 'filipino' => 'Kumusta ka?'],
                ['english' => 'I am fine', 'filipino' => 'Mabuti naman'],
                ['english' => 'Nice to meet you', 'filipino' => 'Ikinagagalak kitang makilala'],
            ]
        ],
        'numbers' => [
            'title' => 'Numbers',
            'items' => [
                ['english' => 'One', 'filipino' => 'Isa'],
                ['english' => 'Two', 'filipino' => 'Dalawa'],
                ['english' => 'Three', 'filipino' => 'Tatlo'],
                ['english' => 'Four', 'filipino' => 'Apat'],
                ['english' => 'Five', 'filipino' => 'Lima'],
                ['english' => 'Six', 'filipino' => 'Anim'],
                ['english' => 'Seven', 'filipino' => 'Pito'],
                ['english' => 'Eight', 'filipino' => 'Walo'],
                ['english' => 'Nine', 'filipino' => 'Siyam'],
                ['english' => 'Ten', 'filipino' => 'Sampu'],
            ]
        ],
        'questions' => [
            'title' => 'Questions',
            'items' => [
                ['english' => 'What is your name?', 'filipino' => 'Ano ang pangalan mo?'],
                ['english' => 'Where are you from?', 'filipino' => 'Saan ka galing?'],
                ['english' => 'What time is it?', 'filipino' => 'Anong oras na?'],
                ['english' => 'How much is this?', 'filipino' => 'Magkano ito?'],
                ['english' => 'Where is the bathroom?', 'filipino' => 'Nasaan ang banyo?'],
            ]
        ],
        'expressions' => [
            'title' => 'Expressions',
            'items' => [
                ['english' => 'I love you', 'filipino' => 'Mahal kita'],
                ['english' => 'I miss you', 'filipino' => 'Miss na kita'],
                ['english' => 'Take care', 'filipino' => 'Ingat ka'],
                ['english' => 'Congratulations', 'filipino' => 'Binabati kita'],
                ['english' => 'Happy birthday', 'filipino' => 'Maligayang kaarawan'],
            ]
        ]
    ];

    /**
     * Get all phrases organized by category
     */
    public function getPhrases(Request $request)
    {
        $category = $request->input('category');

        if ($category && isset($this->phrases[$category])) {
            return response()->json([
                'success' => true,
                'data' => [
                    'category' => $category,
                    'phrases' => $this->phrases[$category]
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => ['phrases' => $this->phrases]
        ]);
    }

    /**
     * Get list of categories
     */
    public function getCategories()
    {
        $categories = [];
        foreach ($this->phrases as $key => $value) {
            $categories[] = [
                'id' => $key,
                'title' => $value['title'],
                'count' => count($value['items'])
            ];
        }

        return response()->json([
            'success' => true,
            'data' => ['categories' => $categories]
        ]);
    }

    /**
     * Get user's learning progress
     */
    public function getProgress(Request $request)
    {
        $progress = LearningProgress::where('user_id', $request->user()->id)
            ->get()
            ->groupBy('category');

        return response()->json([
            'success' => true,
            'data' => ['progress' => $progress]
        ]);
    }

    /**
     * Update learning progress
     */
    public function updateProgress(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => ['required', 'string'],
            'phrase_index' => ['required', 'integer'],
            'learned' => ['required', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $progress = LearningProgress::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'category' => $request->category,
                'phrase_index' => $request->phrase_index,
            ],
            [
                'learned' => $request->learned
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Progress updated',
            'data' => ['progress' => $progress]
        ]);
    }
}
