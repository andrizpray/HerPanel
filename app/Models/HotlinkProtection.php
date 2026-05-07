<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HotlinkProtection extends Model
{
    protected $fillable = [
        'domain_id',
        'is_enabled',
        'allowed_domains',
        'protected_extensions',
        'redirect_url',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'allowed_domains' => 'array',
        'protected_extensions' => 'array',
    ];

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }
}
