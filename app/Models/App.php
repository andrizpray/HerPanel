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
     * Start the app using PM2
     */
    public function start(): bool
    {
        if ($this->status === 'active') {
            return true; // already active
        }

        $pm2Name = $this->getPm2Name();
        
        try {
            if ($this->type === 'nodejs') {
                // For Node.js, we assume there's a package.json with start script
                // Or we can start the main file directly
                $command = "cd {$this->path} && pm2 start npm --name \"{$pm2Name}\" -- start -- --port={$this->port}";
                // Alternative: if there's an app.js or index.js, start that
                // $command = "pm2 start {$this->path}/app.js --name \"{$pm2Name}\"";
            } elseif ($this->type === 'python') {
                // For Python, start with python command
                $entryFile = $this->entry_file ?: 'app.py';
                $command = "pm2 start python --name \"{$pm2Name}\" -- {$this->path}/{$entryFile}";
            } else {
                return false;
            }

            exec($command . " 2>&1", $output, $returnCode);
            
            if ($returnCode === 0) {
                $this->update(['status' => 'active']);
                return true;
            } else {
                \Log::error("Failed to start app {$this->id}: " . implode("\n", $output));
                $this->update(['status' => 'error']);
                return false;
            }
        } catch (\Exception $e) {
            \Log::error("Exception starting app {$this->id}: " . $e->getMessage());
            $this->update(['status' => 'error']);
            return false;
        }
    }

    /**
     * Stop the app via PM2
     */
    public function stop(): bool
    {
        if ($this->status !== 'active') {
            return true; // already stopped
        }

        $pm2Name = $this->getPm2Name();
        
        try {
            exec("pm2 stop \"{$pm2Name}\" 2>&1", $output, $returnCode);
            
            if ($returnCode === 0) {
                $this->update(['status' => 'stopped']);
                return true;
            } else {
                \Log::error("Failed to stop app {$this->id}: " . implode("\n", $output));
                return false;
            }
        } catch (\Exception $e) {
            \Log::error("Exception stopping app {$this->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Restart the app
     */
    public function restart(): bool
    {
        $pm2Name = $this->getPm2Name();
        
        try {
            exec("pm2 restart \"{$pm2Name}\" 2>&1", $output, $returnCode);
            
            if ($returnCode === 0) {
                $this->update(['status' => 'active']);
                return true;
            } else {
                \Log::error("Failed to restart app {$this->id}: " . implode("\n", $output));
                $this->update(['status' => 'error']);
                return false;
            }
        } catch (\Exception $e) {
            \Log::error("Exception restarting app {$this->id}: " . $e->getMessage());
            $this->update(['status' => 'error']);
            return false;
        }
    }

    /**
     * Delete the PM2 process when app is deleted
     */
    public function deletePm2Process(): void
    {
        $pm2Name = $this->getPm2Name();
        exec("pm2 delete \"{$pm2Name}\" 2>&1", $output, $returnCode);
    }

    /**
     * Get unique PM2 process name
     */
    private function getPm2Name(): string
    {
        return "herpanel-app-{$this->id}-{$this->name}";
    }
}
