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
     * Get installed packages - aaPanel style
     */
    public function packages()
    {
        $packages = [
            // Web Servers
            ['name' => 'nginx', 'category' => 'Web Server', 'status' => $this->getServiceStatus('nginx'), 'version' => trim(shell_exec('nginx -v 2>&1') ?: '-') ?: '-', 'installed' => $this->isInstalled('nginx')],
            ['name' => 'apache2', 'category' => 'Web Server', 'status' => $this->getServiceStatus('apache2'), 'version' => trim(shell_exec('apache2 -v 2>&1 | head -1') ?: '-') ?: '-', 'installed' => $this->isInstalled('apache2')],
            
            // PHP
            ['name' => 'php8.3', 'category' => 'PHP', 'status' => $this->getServiceStatus('php8.3-fpm'), 'version' => phpversion(), 'installed' => true],
            ['name' => 'php8.2', 'category' => 'PHP', 'status' => $this->getServiceStatus('php8.2-fpm'), 'version' => '-', 'installed' => $this->isInstalled('php8.2')],
            ['name' => 'php8.1', 'category' => 'PHP', 'status' => $this->getServiceStatus('php8.1-fpm'), 'version' => '-', 'installed' => $this->isInstalled('php8.1')],
            ['name' => 'php7.4', 'category' => 'PHP', 'status' => $this->getServiceStatus('php7.4-fpm'), 'version' => '-', 'installed' => $this->isInstalled('php7.4')],
            ['name' => 'composer', 'category' => 'PHP', 'status' => '-', 'version' => trim(shell_exec('composer --version 2>/dev/null | head -1') ?: '-'), 'installed' => $this->isInstalled('composer')],
            
            // Database
            ['name' => 'mysql', 'category' => 'Database', 'status' => $this->getServiceStatus('mysql'), 'version' => trim(shell_exec('mysql --version 2>&1') ?: '-') ?: '-', 'installed' => $this->isInstalled('mysql')],
            ['name' => 'mariadb', 'category' => 'Database', 'status' => $this->getServiceStatus('mariadb'), 'version' => trim(shell_exec('mariadb --version 2>&1') ?: '-') ?: '-', 'installed' => $this->isInstalled('mariadb')],
            ['name' => 'postgresql', 'category' => 'Database', 'status' => $this->getServiceStatus('postgresql'), 'version' => trim(shell_exec('psql --version 2>&1') ?: '-') ?: '-', 'installed' => $this->isInstalled('postgresql')],
            
            // Cache
            ['name' => 'redis', 'category' => 'Cache', 'status' => $this->getServiceStatus('redis'), 'version' => trim(shell_exec('redis-server --version 2>&1 | head -1') ?: '-') ?: '-', 'installed' => $this->isInstalled('redis')],
            ['name' => 'memcached', 'category' => 'Cache', 'status' => $this->getServiceStatus('memcached'), 'version' => trim(shell_exec('memcached -V 2>&1') ?: '-') ?: '-', 'installed' => $this->isInstalled('memcached')],
            
            // Node.js & Python (aaPanel style)
            ['name' => 'nodejs', 'category' => 'Runtime', 'status' => '-', 'version' => trim(shell_exec('node --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('node')],
            ['name' => 'npm', 'category' => 'Runtime', 'status' => '-', 'version' => trim(shell_exec('npm --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('npm')],
            ['name' => 'yarn', 'category' => 'Runtime', 'status' => '-', 'version' => trim(shell_exec('yarn --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('yarn')],
            ['name' => 'python3', 'category' => 'Runtime', 'status' => '-', 'version' => trim(shell_exec('python3 --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('python3')],
            ['name' => 'pip', 'category' => 'Runtime', 'status' => '-', 'version' => trim(shell_exec('pip --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('pip')],
            
            // Mail
            ['name' => 'postfix', 'category' => 'Mail', 'status' => $this->getServiceStatus('postfix'), 'version' => trim(shell_exec('postconf mail_version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('postfix')],
            ['name' => 'dovecot', 'category' => 'Mail', 'status' => $this->getServiceStatus('dovecot'), 'version' => trim(shell_exec('dovecot --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('dovecot')],
            
            // FTP
            ['name' => 'pure-ftpd', 'category' => 'FTP', 'status' => $this->getServiceStatus('pure-ftpd'), 'version' => trim(shell_exec('pure-ftpd --version 2>&1') ?: '-') ?: '-', 'installed' => $this->isInstalled('pure-ftpd')],
            
            // Security
            ['name' => 'fail2ban', 'category' => 'Security', 'status' => $this->getServiceStatus('fail2ban'), 'version' => trim(shell_exec('fail2ban-client --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('fail2ban')],
            
            // Tools
            ['name' => 'docker', 'category' => 'Tools', 'status' => $this->getServiceStatus('docker'), 'version' => trim(shell_exec('docker --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('docker')],
            ['name' => 'certbot', 'category' => 'Tools', 'status' => '-', 'version' => trim(shell_exec('certbot --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('certbot')],
            ['name' => 'pm2', 'category' => 'Tools', 'status' => '-', 'version' => trim(shell_exec('pm2 --version 2>/dev/null') ?: '-') ?: '-', 'installed' => $this->isInstalled('pm2')],
        ];
        
        return response()->json([
            'success' => true,
            'packages' => $packages
        ]);
    }
    
    /**
     * Install package
     */
    public function installPackage(Request $request)
    {
        $package = $request->input('package');
        
        try {
            shell_exec("sudo apt-get install -y {$package} 2>/dev/null");
            return response()->json(['success' => true, 'message' => "{$package} installed"]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Uninstall package
     */
    public function uninstallPackage(Request $request)
    {
        $package = $request->input('package');
        
        try {
            shell_exec("sudo apt-get remove -y {$package} 2>/dev/null");
            return response()->json(['success' => true, 'message' => "{$package} removed"]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function getServiceStatus($service)
    {
        $output = shell_exec("systemctl is-active {$service} 2>/dev/null");
        return trim($output) === 'active' ? 'running' : 'stopped';
    }

    private function isInstalled($package)
    {
        $which = shell_exec("which {$package} 2>/dev/null");
        return !empty(trim($which));
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