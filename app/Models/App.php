<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class App extends Model
{
    protected $fillable = [
        'domain_id',
        'type',
        'name',
        'path',
        'port',
        'entry_file',
        'status',
    ];

    protected $casts = [
        'port' => 'integer',
    ];

    /**
     * Get the domain that owns the app.
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }

    /**
     * Start the app (Node.js: PM2 start; Python: maybe PM2 or systemd)
     */
    public function start(): bool
    {
        if ($this->type === 'nodejs') {
            // PM2 start with port
            $cmd = "cd {$this->path} && pm2 start npm --name \"{$this->name}\" -- start -- --port={$this->port}";
            // Actually need to run appropriate command based on package.json
            // For simplicity, we assume npm start works.
            exec("cd {$this->path} && pm2 start npm --name \"{$this->name}\" -- start", $output, $ret);
            return $ret === 0;
        } elseif ($this->type === 'python') {
            // PM2 start with python entry file
            exec("pm2 start python --name \"{$this->name}\" -- {$this->entry_file}", $output, $ret);
            return $ret === 0;
        }
        return false;
    }

    /**
     * Stop the app via PM2
     */
    public function stop(): bool
    {
        exec("pm2 stop \"{$this->name}\"", $output, $ret);
        return $ret === 0;
    }

    /**
     * Restart the app
     */
    public function restart(): bool
    {
        exec("pm2 restart \"{$this->name}\"", $output, $ret);
        return $ret === 0;
    }
}
