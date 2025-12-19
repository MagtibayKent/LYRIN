<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'preferred_language',
        'target_languages',
        'daily_goal',
        'notifications_enabled',
    ];

    protected $casts = [
        'target_languages' => 'array',
        'notifications_enabled' => 'boolean',
        'daily_goal' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
