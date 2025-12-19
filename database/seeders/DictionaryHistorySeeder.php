<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DictionaryHistory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DictionaryHistorySeeder extends Seeder
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

        $words = [
            'hello', 'goodbye', 'thank', 'please', 'sorry', 'yes', 'no', 'water', 'food', 'house',
            'family', 'friend', 'love', 'happy', 'sad', 'beautiful', 'good', 'bad', 'big', 'small',
            'today', 'tomorrow', 'yesterday', 'morning', 'night', 'time', 'day', 'week', 'month', 'year',
            'book', 'pen', 'paper', 'computer', 'phone', 'car', 'train', 'airplane', 'city', 'country'
        ];

        $languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
        
        foreach ($users as $user) {
            // Create 10-20 dictionary search history records per user
            $searchCount = rand(10, 20);
            
            for ($i = 0; $i < $searchCount; $i++) {
                DictionaryHistory::create([
                    'user_id' => $user->id,
                    'word' => $words[array_rand($words)],
                    'language' => $languages[array_rand($languages)],
                    'created_at' => now()->subDays(rand(0, 30)),
                ]);
            }
        }

        $this->command->info('Dictionary history seeded successfully!');
    }
}
