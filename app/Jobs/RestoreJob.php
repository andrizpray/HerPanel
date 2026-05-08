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

        if ($backup->status !== 'completed' || !$backup->file_path || !file_exists($backup->file_path)) {
            Log::error("RestoreJob: Backup {$this->backupId} not ready for restore");
            return;
        }

        try {
            Log::info("RestoreJob: Starting restore for backup {$backup->id}");

            $restored = false;

            // Handle based on backup type
            if (in_array($backup->backup_type, ['database', 'full']) && in_array($this->restoreType, ['database', 'full'])) {
                $this->restoreDatabase($backup);
                $restored = true;
            }

            if (in_array($backup->backup_type, ['files', 'full']) && in_array($this->restoreType, ['files', 'full'])) {
                $this->restoreFiles($backup);
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

    protected function restoreDatabase($backup): void
    {
        // Get database credentials from config
        $dbName = config('database.connections.mysql.database', 'herpanel_cpanel');
        $dbUser = config('database.connections.mysql.username', 'herpanel_admin');
        $dbPass = config('database.connections.mysql.password', '');
        $dbHost = config('database.connections.mysql.host', '127.0.0.1');

        // Find SQL file in backup directory or archive
        $sqlFile = $this->findSqlFile($backup->file_path);

        if (!$sqlFile) {
            throw new \Exception("No SQL file found in backup");
        }

        // Build mysql command
        $command = sprintf(
            "mysql --user=%s --password=%s --host=%s %s < %s",
            escapeshellarg($dbUser),
            escapeshellarg($dbPass),
            escapeshellarg($dbHost),
            escapeshellarg($dbName),
            escapeshellarg($sqlFile)
        );

        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            throw new \Exception("MySQL restore failed with return code {$returnVar}");
        }

        Log::info("RestoreJob: Database restored successfully from backup {$backup->id}");
    }

    protected function restoreFiles($backup): void
    {
        $backupDir = dirname($backup->file_path);
        
        // Find zip file
        $zipFile = $this->findZipFile($backup->file_path);

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
        $dir = dirname($backupPath);
        $files = glob("{$dir}/*.sql");
        
        return $files[0] ?? null;
    }

    protected function findZipFile($backupPath)
    {
        // If it's a single ZIP file
        if (pathinfo($backupPath, PATHINFO_EXTENSION) === 'zip') {
            return $backupPath;
        }

        // If it's a zip, return it
        $dir = dirname($backupPath);
        $files = glob("{$dir}/*.zip");
        
        return $files[0] ?? null;
    }
}
