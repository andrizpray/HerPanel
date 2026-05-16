<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class QuickActionController extends Controller
{
    /**
     * Restart services (nginx, php-fpm, mysql)
     */
    public function restart()
    {
        try {
            shell_exec('sudo systemctl restart nginx 2>/dev/null');
            shell_exec('sudo systemctl restart php8.3-fpm 2>/dev/null');
            shell_exec('sudo systemctl restart mysql 2>/dev/null');
            return response()->json(['success' => true, 'message' => 'Services restarted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Create backup
     */
    public function backup(Request $request)
    {
        $type = $request->input('type', 'files');
        
        try {
            $filename = "backup_{$type}_" . date('Y-m-d_H-i-s') . ".tar.gz";
            $backupPath = storage_path("app/backups/{$filename}");
            
            if (!Storage::exists('backups')) {
                Storage::makeDirectory('backups');
            }
            
            if ($type === 'files') {
                shell_exec("tar -czf {$backupPath} /var/www/herpanel --exclude=node_modules --exclude=vendor 2>/dev/null");
            } elseif ($type === 'database') {
                $dbName = env('DB_DATABASE', 'herpanel_db');
                $dbUser = env('DB_USERNAME', 'root');
                $dbPass = env('DB_PASSWORD', '');
                shell_exec("mysqldump -u {$dbUser} -p{$dbPass} {$dbName} > {$backupPath}.sql 2>/dev/null");
            }
            
            return response()->json([
                'success' => true, 
                'message' => 'Backup created',
                'filename' => $filename
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get installed packages
     */
    public function packages()
    {
        $packages = [
            'nginx' => shell_exec('nginx -v 2>&1') ?: 'Not installed',
            'php' => phpversion(),
            'mysql' => shell_exec('mysql --version 2>&1') ?: 'Not installed',
            'node' => shell_exec('node --version 2>&1') ?: 'Not installed',
            'npm' => shell_exec('npm --version 2>&1') ?: 'Not installed',
            'redis' => shell_exec('redis-cli --version 2>&1') ?: 'Not installed',
        ];
        
        return response()->json([
            'success' => true,
            'packages' => $packages
        ]);
    }

    /**
     * List SSH keys (stub - needs implementation)
     */
    public function sshKeys()
    {
        $keys = [];
        $sshDir = '/home/' . get_current_user() . '/.ssh';
        
        if (is_dir($sshDir)) {
            $files = glob($sshDir . '/*.pub');
            foreach ($files as $file) {
                $keys[] = [
                    'name' => basename($file),
                    'fingerprint' => shell_exec("ssh-keygen -lf {$file} 2>/dev/null") ?: 'Unknown',
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'keys' => $keys
        ]);
    }

    /**
     * Generate report (stub)
     */
    public function report()
    {
        $report = [
            'generated_at' => now()->toDateTimeString(),
            'server_load' => sys_getloadavg(),
            'memory_usage' => memory_get_usage(true),
            'disk_usage' => disk_free_space('/'),
        ];
        
        return response()->json([
            'success' => true,
            'report' => $report
        ]);
    }
}