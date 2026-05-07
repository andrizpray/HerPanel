<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MimeType extends Model
{
    protected $fillable = [
        'domain_id',
        'extension',
        'mime_type',
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
