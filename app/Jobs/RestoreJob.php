<?php

namespace App\Jobs;

use App\Models\Backup;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class RestoreJob implements ShouldQueue
{
    use Queueable;

    public $timeout = 3600; // 1 hour timeout

    protected $backupId;
    protected $restoreType; // 'database', 'files', 'full'

    public function __construct($backupId, $restoreType = 'full')
    {
        $this->backupId = $backupId;
        $this->restoreType = $restoreType;
    }

    public function handle(): void
    {
        $backup = Backup::find($this->backupId);

        if (!$backup) {
            Log::error("RestoreJob: Backup {$this->backupId} not found");
            return;
        }

        // Convert relative path to absolute
        $absolutePath = storage_path('app/' . $backup->file_path);

        if ($backup->status !== 'completed' || !$backup->file_path || !file_exists($absolutePath)) {
            Log::error("RestoreJob: Backup {$this->backupId} not ready for restore");
            return;
        }

        try {
            Log::info("RestoreJob: Starting restore for backup {$backup->id}");

            $restored = false;

            // Handle based on backup type
            if (in_array($backup->backup_type, ['database', 'full']) && in_array($this->restoreType, ['database', 'full'])) {
                $this->restoreDatabase($backup, $absolutePath);
                $restored = true;
            }

            if (in_array($backup->backup_type, ['files', 'full']) && in_array($this->restoreType, ['files', 'full'])) {
                $this->restoreFiles($backup, $absolutePath);
                $restored = true;
            }

            if ($restored) {
                Log::info("RestoreJob: Restore completed for backup {$backup->id}");
            } else {
                throw new \Exception("No restore action performed. Backup type: {$backup->backup_type}, Restore type: {$this->restoreType}");
            }

        } catch (\Exception $e) {
            Log::error("RestoreJob failed: " . $e->getMessage());
        }
    }

    protected function restoreDatabase($backup, $absolutePath): void
    {
        // Get database credentials from config
        $dbName = config('database.connections.mysql.database', 'herpanel_cpanel');
        $dbUser = config('database.connections.mysql.username', 'herpanel_admin');
        $dbPass = config('database.connections.mysql.password', '');
        $dbHost = config('database.connections.mysql.host', '127.0.0.1');

        // Find SQL file - if it's a ZIP, extract first
        $sqlFile = $this->findSqlFile($absolutePath);

        if (!$sqlFile) {
            throw new \Exception("No SQL file found in backup");
        }

        // Build mysql command using temp config file to hide password
        $optFile = tempnam(sys_get_temp_dir(), 'mysql_');
        file_put_contents($optFile, "[client]\npassword={$dbPass}\n");
        chmod($optFile, 0600);

        $command = sprintf(
            "mysql --defaults-extra-file=%s --user=%s --host=%s %s < %s",
            escapeshellarg($optFile),
            escapeshellarg($dbUser),
            escapeshellarg($dbHost),
            escapeshellarg($dbName),
            escapeshellarg($sqlFile)
        );

        exec($command, $output, $returnVar);
        @unlink($optFile); // Delete temp file immediately

        if ($returnVar !== 0) {
            throw new \Exception("MySQL restore failed with return code {$returnVar}");
        }

        Log::info("RestoreJob: Database restored successfully from backup {$backup->id}");
    }

    protected function restoreFiles($backup, $absolutePath): void
    {
        // Find zip file - if it's a ZIP, extract
        $zipFile = $this->findZipFile($absolutePath);

        if (!$zipFile) {
            throw new \Exception("No ZIP file found in backup");
        }

        // Extract to project root
        $projectRoot = base_path();
        
        $zip = new \ZipArchive();
        if ($zip->open($zipFile) !== TRUE) {
            throw new \Exception("Cannot open zip file: {$zipFile}");
        }

        $zip->extractTo($projectRoot);
        $zip->close();

        Log::info("RestoreJob: Files restored successfully from backup {$backup->id}");
    }

    protected function findSqlFile($backupPath)
    {
        // If it's a single SQL file
        if (pathinfo($backupPath, PATHINFO_EXTENSION) === 'sql') {
            return $backupPath;
        }

        // If it's a zip, find SQL inside
        if (pathinfo($backupPath, PATHINFO_EXTENSION) === 'zip') {
            $zip = new \ZipArchive();
            if ($zip->open($backupPath) === TRUE) {
                // Extract to temp dir first
                $tempDir = sys_get_temp_dir() . '/restore_' . uniqid();
                mkdir($tempDir, 0755, true);
                
                // Find SQL file in archive
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);
                    if (pathinfo($filename, PATHINFO_EXTENSION) === 'sql') {
                        // Extract just this file
                        $zip->extractTo($tempDir, [$filename]);
                        $zip->close();
                        return $tempDir . '/' . $filename;
                    }
                }
                $zip->close();
            }
        }

        return null;
    }

    protected function findZipFile($backupPath)
    {
        // If it's a single ZIP file
        if (pathinfo($backupPath, PATHINFO_EXTENSION) === 'zip') {
            return $backupPath;
        }

        return null;
    }
}
