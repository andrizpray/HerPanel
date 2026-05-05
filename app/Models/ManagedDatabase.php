<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManagedDatabase extends Model
{
    protected $fillable = ['user_id', 'db_name', 'db_user', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
