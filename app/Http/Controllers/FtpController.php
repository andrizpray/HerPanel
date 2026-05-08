<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\FtpUser;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FtpController extends Controller
{
    /**
     * Display a listing of the FTP users.
     */
    public function index()
    {
        $ftpUsers = FtpUser::with('domain')->latest()->paginate(10);
        $domains = Domain::all(['id', 'domain_name']);
        
        return Inertia::render('FTP/Index', [
            'ftpUsers' => $ftpUsers,
            'domains' => $domains,
        ]);
    }

    /**
     * Show the form for creating a new FTP user.
     */
    public function create()
    {
        $domains = Domain::all(['id', 'domain_name']);
        return Inertia::render('FTP/Create', [
            'domains' => $domains,
        ]);
    }

    /**
     * Store a newly created FTP user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'domain_id' => 'nullable|exists:domains,id',
            'username' => 'required|string|max:255|unique:ftp_users',
            'password' => 'required|string|min:6',
            'quota_mb' => 'integer|min:0',
            'directory' => 'nullable|string|max:255',
            'status' => 'in:active,inactive',
        ]);

        // Set default directory if not provided
        if (empty($validated['directory']) && !empty($validated['domain_id'])) {
            $domain = Domain::find($validated['domain_id']);
            if ($domain) {
                $validated['directory'] = '/var/www/' . $domain->domain_name;
            }
        }

        $ftpUser = FtpUser::create($validated);

        // TODO: Actually create system FTP user via vsftpd/pure-ftpd
        // For now, just store in DB

        return redirect()->route('ftp.index')->with('success', 'FTP user created successfully.');
    }

    /**
     * Display the specified FTP user.
     */
    public function show(FtpUser $ftpUser)
    {
        return Inertia::render('FTP/Show', [
            'ftpUser' => $ftpUser->load('domain'),
        ]);
    }

    /**
     * Show the form for editing the specified FTP user.
     */
    public function edit(FtpUser $ftpUser)
    {
        $domains = Domain::all(['id', 'domain_name']);
        return Inertia::render('FTP/Edit', [
            'ftpUser' => $ftpUser,
            'domains' => $domains,
        ]);
    }

    /**
     * Update the specified FTP user in storage.
     */
    public function update(Request $request, FtpUser $ftpUser)
    {
        $validated = $request->validate([
            'domain_id' => 'nullable|exists:domains,id',
            'username' => 'required|string|max:255|unique:ftp_users,username,' . $ftpUser->id,
            'password' => 'nullable|string|min:6',
            'quota_mb' => 'integer|min:0',
            'directory' => 'nullable|string|max:255',
            'status' => 'in:active,inactive',
        ]);

        // Update password only if provided
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        // Update directory if domain changed
        if (isset($validated['domain_id']) && $validated['domain_id'] != $ftpUser->domain_id) {
            $domain = Domain::find($validated['domain_id']);
            if ($domain) {
                $validated['directory'] = '/var/www/' . $domain->domain_name;
            }
        }

        $ftpUser->update($validated);

        // TODO: Update system FTP user

        return redirect()->route('ftp.index')->with('success', 'FTP user updated successfully.');
    }

    /**
     * Remove the specified FTP user from storage.
     */
    public function destroy(FtpUser $ftpUser)
    {
        $ftpUser->delete();
        // TODO: Remove system FTP user

        return redirect()->route('ftp.index')->with('success', 'FTP user deleted successfully.');
    }
}
