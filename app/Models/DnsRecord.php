<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DnsRecord extends Model
{
    protected $fillable = [
        'domain_id',
        'type',
        'name',
        'content',
        'ttl',
        'priority',
        'status',
    ];

    protected $casts = [
        'ttl' => 'integer',
        'priority' => 'integer',
    ];

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }
}
