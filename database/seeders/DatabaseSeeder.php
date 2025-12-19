<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            QuizHistorySeeder::class,
            DictionaryHistorySeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('  Database Seeded Successfully!');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('Demo Users Created:');
        $this->command->info('  1. Email: demo@lyrin.com | Password: password123');
        $this->command->info('  2. Email: test@lyrin.com | Password: password123');
        $this->command->info('  3. Email: admin@lyrin.com | Password: admin123');
        $this->command->info('');
        $this->command->info('Each user has:');
        $this->command->info('  - Learning preferences configured');
        $this->command->info('  - 5-10 quiz history records');
        $this->command->info('  - 10-20 dictionary search records');
        $this->command->info('========================================');
    }
}

