<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizHistory extends Model
{
    use HasFactory;

    protected $table = 'quiz_history';

    protected $fillable = [
        'user_id',
        'language',
        'level',
        'score',
        'total_questions',
    ];

    protected $casts = [
        'score' => 'integer',
        'total_questions' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

