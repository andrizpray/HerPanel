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
                
                // Update backup record
                $backup->file_path = $finalArchive;
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
            // Get database credentials from .env
            $dbName = env('DB_DATABASE', 'herpanel_cpanel');
            $dbUser = env('DB_USERNAME', 'herpanel_user');
            $dbPass = env('DB_PASSWORD', '');
            $dbHost = env('DB_HOST', '127.0.0.1');

            $filename = "database_{$backup->id}_" . date('Y-m-d_H-i-s') . ".sql";
            $filepath = "{$backupDir}/{$filename}";

            // Build mysqldump command
            $command = sprintf(
                "mysqldump --user=%s --password=%s --host=%s %s > %s",
                escapeshellarg($dbUser),
                escapeshellarg($dbPass),
                escapeshellarg($dbHost),
                escapeshellarg($dbName),
                escapeshellarg($filepath)
            );

            exec($command, $output, $returnVar);

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

        // Remove individual files
        foreach ($files as $file) {
            @unlink($file);
        }

        return $filepath;
    }
}
