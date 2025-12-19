<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\QuizHistory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $languages = ['spanish', 'french', 'german', 'italian', 'portuguese', 'japanese', 'korean', 'chinese'];
        
        foreach ($users as $user) {
            // Create 5-10 quiz history records per user
            $quizCount = rand(5, 10);
            
            for ($i = 0; $i < $quizCount; $i++) {
                $totalQuestions = rand(5, 15);
                $score = rand(0, $totalQuestions);
                
                QuizHistory::create([
                    'user_id' => $user->id,
                    'language' => $languages[array_rand($languages)],
                    'score' => $score,
                    'total_questions' => $totalQuestions,
                    'created_at' => now()->subDays(rand(0, 30)),
                ]);
            }
        }

        $this->command->info('Quiz history seeded successfully!');
    }
}
