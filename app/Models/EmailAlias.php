<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailAlias extends Model
{
    use HasFactory;

    protected $table = 'virtual_aliases';

    protected $fillable = [
        'domain_id',
        'source',
        'destination',
    ];

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }
}
