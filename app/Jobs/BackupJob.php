<?php

namespace App\Jobs;

use App\Models\Backup;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BackupJob implements ShouldQueue
{
    use Queueable;

    public $timeout = 3600; // 1 hour timeout for large backups

    protected $backupId;

    public function __construct($backupId)
    {
        $this->backupId = $backupId;
    }

    public function handle(): void
    {
        $backup = Backup::find($this->backupId);
        
        if (!$backup) {
            Log::error("BackupJob: Backup {$this->backupId} not found");
            return;
        }

        try {
            // Create backup directory
            $backupDir = storage_path("app/backups/{$backup->user_id}/{$backup->id}");
            if (!is_dir($backupDir)) {
                mkdir($backupDir, 0755, true);
            }

            $files = [];

            // Handle database backup
            if (in_array($backup->backup_type, ['database', 'full'])) {
                $dbFile = $this->backupDatabase($backup, $backupDir);
                if ($dbFile) {
                    $files[] = $dbFile;
                }
            }

            // Handle files backup
            if (in_array($backup->backup_type, ['files', 'full'])) {
                $filesFile = $this->backupFiles($backup, $backupDir);
                if ($filesFile) {
                    $files[] = $filesFile;
                }
            }

            // Create final archive if multiple files
            if (count($files) > 0) {
                $finalArchive = $this->createFinalArchive($backup, $backupDir, $files);
                
                // Update backup record with RELATIVE path (store relative to storage/app/)
                $backup->file_path = str_replace(storage_path('app/'), '', $finalArchive);
                $backup->file_size = filesize($finalArchive);
                $backup->status = 'completed';
                $backup->save();
                
                Log::info("BackupJob: Backup {$backup->id} completed successfully");
            } else {
                throw new \Exception("No backup files were created");
            }

        } catch (\Exception $e) {
            Log::error("BackupJob failed: " . $e->getMessage());
            
            $backup->status = 'failed';
            $backup->save();
        }
    }

    protected function backupDatabase($backup, $backupDir)
    {
        try {
            // Get database credentials from Laravel config (not env() for queue safety)
            $dbName = config('database.connections.mysql.database', 'herpanel_cpanel');
            $dbUser = config('database.connections.mysql.username', 'herpanel_admin');
            $dbPass = config('database.connections.mysql.password', '');
            $dbHost = config('database.connections.mysql.host', '127.0.0.1');

            $filename = "database_{$backup->id}_" . date('Y-m-d_H-i-s') . ".sql";
            $filepath = "{$backupDir}/{$filename}";

            // Build mysqldump command using temp config file to hide password
            $optFile = tempnam(sys_get_temp_dir(), 'mysql_');
            file_put_contents($optFile, "[client]\npassword={$dbPass}\n");
            chmod($optFile, 0600);

            $command = sprintf(
                "mysqldump --defaults-extra-file=%s --user=%s --host=%s %s > %s",
                escapeshellarg($optFile),
                escapeshellarg($dbUser),
                escapeshellarg($dbHost),
                escapeshellarg($dbName),
                escapeshellarg($filepath)
            );

            exec($command, $output, $returnVar);
            @unlink($optFile); // Delete temp file immediately

            if ($returnVar !== 0) {
                throw new \Exception("mysqldump failed with return code {$returnVar}");
            }

            return $filepath;

        } catch (\Exception $e) {
            Log::error("Database backup failed: " . $e->getMessage());
            return null;
        }
    }

    protected function backupFiles($backup, $backupDir)
    {
        try {
            $filename = "files_{$backup->id}_" . date('Y-m-d_H-i-s') . ".zip";
            $filepath = "{$backupDir}/{$filename}";

            // Base directory to backup (project root excluding vendor, node_modules, storage)
            $baseDir = base_path();
            
            // Create zip archive
            $zip = new \ZipArchive();
            if ($zip->open($filepath, \ZipArchive::CREATE) !== TRUE) {
                throw new \Exception("Cannot create zip file");
            }

            // Add files recursively, excluding certain directories
            $excludeDirs = ['vendor', 'node_modules', 'storage/framework', 'storage/logs', '.git'];
            $this->addDirToZip($zip, $baseDir, basename($baseDir), $excludeDirs);

            $zip->close();

            return $filepath;

        } catch (\Exception $e) {
            Log::error("Files backup failed: " . $e->getMessage());
            return null;
        }
    }

    protected function addDirToZip($zip, $dir, $zipDir, $excludeDirs)
    {
        $handle = opendir($dir);
        while (($file = readdir($handle)) !== false) {
            if ($file == '.' || $file == '..') continue;
            
            $path = $dir . '/' . $file;
            $zipPath = $zipDir . '/' . $file;

            // Check if this directory should be excluded
            foreach ($excludeDirs as $exclude) {
                if (strpos($zipPath, $exclude) !== false) {
                    continue 2; // Skip this file/dir
                }
            }

            if (is_file($path)) {
                $zip->addFile($path, $zipPath);
            } elseif (is_dir($path)) {
                $zip->addEmptyDir($zipPath);
                $this->addDirToZip($zip, $path, $zipPath, $excludeDirs);
            }
        }
        closedir($handle);
    }

    protected function createFinalArchive($backup, $backupDir, $files)
    {
        if (count($files) == 1) {
            // Only one file, return it directly
            return $files[0];
        }

        // Multiple files, create a combined archive
        $filename = "backup_{$backup->id}_" . date('Y-m-d_H-i-s') . ".zip";
        $filepath = "{$backupDir}/{$filename}";

        $zip = new \ZipArchive();
        $zip->open($filepath, \ZipArchive::CREATE);

        foreach ($files as $file) {
            $zip->addFile($file, basename($file));
        }

        $zip->close();

        // Bug #3 Fix: Verify ZIP was created successfully before deleting source files
        if (!file_exists($filepath) || filesize($filepath) === 0) {
            throw new \Exception("Final archive creation failed - file missing or empty");
        }

        // Remove individual files only after successful ZIP creation
        foreach ($files as $file) {
            @unlink($file);
        }

        return $filepath;
    }
}
