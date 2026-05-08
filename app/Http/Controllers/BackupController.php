<?php

namespace App\Http\Controllers;

use App\Models\Backup;
use App\Models\Domain;
use App\Jobs\BackupJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BackupController extends Controller
{
    public function index()
    {
        $backups = Backup::where('user_id', auth()->id())
            ->with('domain')
            ->latest()
            ->get();

        $domains = Domain::where('user_id', auth()->id())->get();

        return Inertia::render('Backups/Index', [
            'backups' => $backups,
            'domains' => $domains,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'domain_id' => 'nullable|integer|exists:domains,id',
            'backup_type' => 'required|in:full,database,files',
        ]);

        // Verify domain ownership if domain_id is provided
        if (!empty($validated['domain_id'])) {
            $domain = \App\Models\Domain::where('user_id', auth()->id())
                ->where('id', $validated['domain_id'])
                ->firstOrFail();
        }

        $backup = Backup::create([
            'user_id' => auth()->id(),
            'domain_id' => $validated['domain_id'],
            'backup_type' => $validated['backup_type'],
            'file_path' => '',
            'file_size' => null,
            'status' => 'pending',
        ]);

        // Dispatch backup job
        dispatch(new BackupJob($backup->id));

        return redirect()->route('backups.index')
            ->with('success', 'Backup is being processed. Status will update automatically.');
    }

    public function destroy($id)
    {
        $backup = Backup::where('user_id', auth()->id())->findOrFail($id);
        // Delete backup file from storage (convert relative to absolute)
        if ($backup->file_path) {
            $absolutePath = storage_path('app/' . $backup->file_path);
            if (file_exists($absolutePath)) {
                @unlink($absolutePath);
                // Clean up directory if empty
                $dir = dirname($absolutePath);
                if (is_dir($dir) && count(scandir($dir)) == 2) { // only . and ..
                    @rmdir($dir);
                }
            }
        }
        $backup->delete();

        return redirect()->route('backups.index')
            ->with('success', 'Backup deleted successfully.');
    }

    public function download($id)
    {
        $backup = Backup::where('user_id', auth()->id())->findOrFail($id);
        
        // Convert relative path to absolute
        $absolutePath = storage_path('app/' . $backup->file_path);
        
        if ($backup->status !== 'completed' || !$backup->file_path || !file_exists($absolutePath)) {
            abort(404, 'Backup file not found or not ready.');
        }

        return response()->download($absolutePath, basename($absolutePath));
    }

    public function restore(Request $request, $id)
    {
        $backup = Backup::where('user_id', auth()->id())->findOrFail($id);
        
        if ($backup->status !== 'completed' || !$backup->file_path || !file_exists($backup->file_path)) {
            return back()->withErrors(['restore' => 'Backup file not found or not ready.']);
        }

        $validated = $request->validate([
            'restore_type' => 'required|in:database,files,full',
        ]);

        // Validate backup type matches restore type
        if ($backup->backup_type === 'database' && $validated['restore_type'] === 'files') {
            return back()->withErrors(['restore' => 'This backup does not contain files.']);
        }
        
        if ($backup->backup_type === 'files' && $validated['restore_type'] === 'database') {
            return back()->withErrors(['restore' => 'This backup does not contain database.']);
        }

        // Dispatch restore job
        dispatch(new \App\Jobs\RestoreJob($backup->id, $validated['restore_type']));

        return redirect()->route('backups.index')
            ->with('success', 'Restore is being processed. Check logs for progress.');
    }
}
