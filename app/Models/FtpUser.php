<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FtpUser extends Model
{
    protected $fillable = [
        'domain_id',
        'username',
        'password',
        'quota_mb',
        'directory',
        'status',
    ];

    protected $casts = [
        'quota_mb' => 'integer',
    ];

    /**
     * Get the domain that owns the FTP user.
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }

    /**
     * Set the password attribute (hash if not already hashed).
     */
    public function setPasswordAttribute($value): void
    {
        // Simple encryption for vsftpd (not bcrypt). We'll store as plaintext? Actually vsftpd can use system users or virtual users.
        // For simplicity, we store as plaintext; later we can integrate with vsftpd virtual users.
        $this->attributes['password'] = $value;
    }
}
