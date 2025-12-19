<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\LearningPreference;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo user
        $demoUser = User::create([
            'name' => 'Demo User',
            'username' => 'demouser',
            'email' => 'demo@lyrin.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Create learning preferences for demo user
        LearningPreference::create([
            'user_id' => $demoUser->id,
            'preferred_language' => 'english',
            'target_languages' => ['spanish', 'french', 'german'],
            'daily_goal' => 10,
            'notifications_enabled' => true,
        ]);

        // Create test user
        $testUser = User::create([
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@lyrin.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Create learning preferences for test user
        LearningPreference::create([
            'user_id' => $testUser->id,
            'preferred_language' => 'english',
            'target_languages' => ['japanese', 'korean'],
            'daily_goal' => 15,
            'notifications_enabled' => false,
        ]);

        // Create admin user
        $adminUser = User::create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@lyrin.com',
            'password' => Hash::make('admin123'),
            'email_verified_at' => now(),
        ]);

        LearningPreference::create([
            'user_id' => $adminUser->id,
            'preferred_language' => 'english',
            'target_languages' => ['spanish', 'french', 'german', 'italian', 'portuguese'],
            'daily_goal' => 20,
            'notifications_enabled' => true,
        ]);
    }
}
