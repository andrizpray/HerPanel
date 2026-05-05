<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Database extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'db_name',
        'db_user',
        'db_password',
        'character_set',
        'collation',
    ];

    protected $hidden = [
        'db_password',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
