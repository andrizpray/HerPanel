<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FirewallRule extends Model
{
    protected $fillable = [
        'user_id',
        'domain_id',
        'type',
        'source',
        'port',
        'protocol',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }
}
