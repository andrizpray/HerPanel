<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RedirectRule extends Model
{
    protected $fillable = [
        'domain_id',
        'source_path',
        'destination_url',
        'redirect_type',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }
}
