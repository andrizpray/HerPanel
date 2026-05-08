<?php

namespace App\Http\Controllers;

use App\Models\App;
use App\Models\Domain;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppController extends Controller
{
    /**
     * Display a listing of the apps.
     */
    public function index()
    {
        $apps = App::with('domain')->latest()->paginate(10);
        $domains = Domain::all(['id', 'domain_name']);
        return Inertia::render('Apps/Index', [
            'apps' => $apps,
            'domains' => $domains,
        ]);
    }

    /**
     * Show the form for creating a new app.
     */
    public function create()
    {
        $domains = Domain::all(['id', 'domain_name']);
        return Inertia::render('Apps/Create', [
            'domains' => $domains,
        ]);
    }

    /**
     * Store a newly created app in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'domain_id' => 'nullable|exists:domains,id',
            'type' => 'required|in:nodejs,python',
            'name' => 'required|string|max:255',
            'path' => 'required|string|max:255',
            'port' => 'nullable|integer|min:1024|max:65535',
            'entry_file' => 'nullable|string|max:255',
            'status' => 'in:active,stopped,error',
        ]);

        $app = App::create($validated);

        // Optionally start the app if status is active
        if ($app->status === 'active') {
            $app->start();
        }

        return redirect()->route('apps.index')->with('success', 'App created successfully.');
    }

    /**
     * Display the specified app.
     */
    public function show(App $app)
    {
        return Inertia::render('Apps/Show', [
            'app' => $app->load('domain'),
        ]);
    }

    /**
     * Show the form for editing the specified app.
     */
    public function edit(App $app)
    {
        $domains = Domain::all(['id', 'domain_name']);
        return Inertia::render('Apps/Edit', [
            'app' => $app,
            'domains' => $domains,
        ]);
    }

    /**
     * Update the specified app in storage.
     */
    public function update(Request $request, App $app)
    {
        $validated = $request->validate([
            'domain_id' => 'nullable|exists:domains,id',
            'type' => 'required|in:nodejs,python',
            'name' => 'required|string|max:255',
            'path' => 'required|string|max:255',
            'port' => 'nullable|integer|min:1024|max:65535',
            'entry_file' => 'nullable|string|max:255',
            'status' => 'in:active,stopped,error',
        ]);

        $app->update($validated);

        return redirect()->route('apps.index')->with('success', 'App updated successfully.');
    }

    /**
     * Remove the specified app from storage.
     */
    public function destroy(App $app)
    {
        // Stop the app first
        if ($app->status === 'active') {
            $app->stop();
        }
        $app->delete();
        return redirect()->route('apps.index')->with('success', 'App deleted successfully.');
    }

    /**
     * Start the app.
     */
    public function start(App $app)
    {
        if ($app->start()) {
            $app->update(['status' => 'active']);
            return redirect()->back()->with('success', 'App started.');
        } else {
            $app->update(['status' => 'error']);
            return redirect()->back()->with('error', 'Failed to start app.');
        }
    }

    /**
     * Stop the app.
     */
    public function stop(App $app)
    {
        if ($app->stop()) {
            $app->update(['status' => 'stopped']);
            return redirect()->back()->with('success', 'App stopped.');
        } else {
            return redirect()->back()->with('error', 'Failed to stop app.');
        }
    }

    /**
     * Restart the app.
     */
    public function restart(App $app)
    {
        if ($app->restart()) {
            $app->update(['status' => 'active']);
            return redirect()->back()->with('success', 'App restarted.');
        } else {
            $app->update(['status' => 'error']);
            return redirect()->back()->with('error', 'Failed to restart app.');
        }
    }
}
