<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DictionarySearch extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'word',
        'phonetic',
        'found',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'found' => 'boolean',
    ];

    /**
     * Get the user that owns the search.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
