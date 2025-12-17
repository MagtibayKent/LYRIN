<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_text',
        'translated_text',
        'source_language',
        'target_language',
    ];

    /**
     * Get the user that owns the translation
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
