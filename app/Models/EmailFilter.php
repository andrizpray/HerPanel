<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailFilter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'domain_id',
        'email_id',
        'name',
        'conditions',
        'actions',
        'is_active',
    ];

    protected $casts = [
        'conditions' => 'array',
        'actions' => 'array',
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

    public function email()
    {
        return $this->belongsTo(EmailAccount::class, 'email_id');
    }
}
