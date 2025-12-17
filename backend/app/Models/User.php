<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the user's translations
     */
    public function translations()
    {
        return $this->hasMany(Translation::class);
    }

    /**
     * Get the user's quiz scores
     */
    public function quizScores()
    {
        return $this->hasMany(QuizScore::class);
    }

    /**
     * Get the user's learning progress
     */
    public function learningProgress()
    {
        return $this->hasMany(LearningProgress::class);
    }
}
