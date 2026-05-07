<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ErrorPage extends Model
{
    protected $fillable = [
        'domain_id',
        'error_code',
        'content',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }
}
