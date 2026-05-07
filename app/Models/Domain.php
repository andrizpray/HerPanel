<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Domain extends Model
{
    protected $fillable = ['user_id', 'domain_name', 'status', 'php_version', 'ssl_status', 'ssl_issuer', 'ssl_valid_from', 'ssl_valid_to'];

    protected $casts = [
        'ssl_valid_from' => 'datetime',
        'ssl_valid_to' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dnsRecords()
    {
        return $this->hasMany(DnsRecord::class);
    }

    public function subdomains()
    {
        return $this->hasMany(Subdomain::class);
    }

    public function errorPages()
    {
        return $this->hasMany(ErrorPage::class);
    }

    public function mimeTypes()
    {
        return $this->hasMany(MimeType::class);
    }


}
