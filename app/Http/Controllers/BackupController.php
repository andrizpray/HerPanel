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
            'domain_id' => 'nullable|exists:domains,id',
            'backup_type' => 'required|in:full,database,files',
        ]);

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
        // TODO: Delete backup file from storage
        $backup->delete();

        return redirect()->route('backups.index')
            ->with('success', 'Backup deleted successfully.');
    }
}
