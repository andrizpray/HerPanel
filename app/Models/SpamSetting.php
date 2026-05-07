<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpamSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'domain_id',
        'email_id',
        'spam_threshold',
        'action_on_spam',
        'is_active',
    ];

    protected $casts = [
        'spam_threshold' => 'decimal:1',
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
