<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subdomain extends Model
{
    protected $fillable = ['domain_id', 'name', 'status'];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    /**
     * Get the parent domain.
     */
    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }
    
    /**
     * Get full subdomain name (e.g., www.drizdev.space)
     */
    public function getFullNameAttribute(): string
    {
        return $this->name . '.' . $this->domain->domain_name;
    }
}
