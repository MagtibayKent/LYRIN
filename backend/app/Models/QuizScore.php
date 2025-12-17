<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'language',
        'score',
        'total',
        'percentage',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the score
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
