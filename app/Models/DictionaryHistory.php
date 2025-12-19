<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DictionaryHistory extends Model
{
    use HasFactory;

    protected $table = 'dictionary_history';

    protected $fillable = [
        'user_id',
        'word',
        'language',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

