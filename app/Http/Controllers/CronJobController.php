<?php

namespace App\Http\Controllers;

use App\Models\CronJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CronJobController extends Controller
{
    public function index()
    {
        $cronJobs = CronJob::where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('CronJobs/Index', [
            'cronJobs' => $cronJobs,
        ]);
    }

    public function create()
    {
        return Inertia::render('CronJobs/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'command' => 'required|string',
            'schedule' => 'required|string|max:100',
        ]);

        CronJob::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'command' => $validated['command'],
            'schedule' => $validated['schedule'],
            'is_active' => true,
        ]);

        return redirect()->route('cron-jobs.index')
            ->with('success', 'Cron job created successfully.');
    }

    public function edit($id)
    {
        $cronJob = CronJob::where('user_id', auth()->id())->findOrFail($id);
        return Inertia::render('CronJobs/Edit', [
            'cronJob' => $cronJob,
        ]);
    }

    public function update(Request $request, $id)
    {
        $cronJob = CronJob::where('user_id', auth()->id())->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'command' => 'required|string',
            'schedule' => 'required|string|max:100',
        ]);

        $cronJob->update($validated);

        return redirect()->route('cron-jobs.index')
            ->with('success', 'Cron job updated successfully.');
    }

    public function destroy($id)
    {
        $cronJob = CronJob::where('user_id', auth()->id())->findOrFail($id);
        $cronJob->delete();

        return redirect()->route('cron-jobs.index')
            ->with('success', 'Cron job deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $cronJob = CronJob::where('user_id', auth()->id())->findOrFail($id);
        $cronJob->update(['is_active' => !$cronJob->is_active]);

        $status = $cronJob->is_active ? 'activated' : 'deactivated';
        return redirect()->route('cron-jobs.index')
            ->with('success', "Cron job {$status} successfully.");
    }

    public function runNow($id)
    {
        $cronJob = CronJob::where('user_id', auth()->id())->findOrFail($id);

        // Execute command
        $output = [];
        $returnVar = 0;
        exec($cronJob->command . ' 2>&1', $output, $returnVar);

        $cronJob->update([
            'last_run_at' => now(),
        ]);

        $message = $returnVar === 0 ? 'Cron job executed successfully.' : 'Cron job executed with errors.';
        return redirect()->route('cron-jobs.index')
            ->with('success', $message);
    }
}
