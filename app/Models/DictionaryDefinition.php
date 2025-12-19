<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DictionaryDefinition extends Model
{
    use HasFactory;

    protected $fillable = [
        'word',
        'language',
        'definition_data',
    ];

    protected $casts = [
        'definition_data' => 'array',
    ];

    public function histories()
    {
        return $this->hasMany(DictionaryHistory::class, 'definition_id');
    }
}
