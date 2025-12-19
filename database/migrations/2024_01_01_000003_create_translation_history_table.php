<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translation_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('original_text');
            $table->text('translated_text');
            $table->string('from_language', 10);
            $table->string('to_language', 10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translation_history');
    }
};

