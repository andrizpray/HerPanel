<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\FtpUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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

        // Create system user for FTP
        $systemUserCreated = false;
        if (!empty($validated['directory'])) {
            $systemUserCreated = $this->createSystemUser(
                $validated['username'],
                $validated['password'],
                $validated['directory']
            );
            
            if (!$systemUserCreated) {
                Log::warning("Failed to create system user for FTP user: {$validated['username']}");
                // Continue anyway, we'll store in DB
            }
        }

        $ftpUser = FtpUser::create($validated);

        return redirect()->route('ftp.index')->with(
            $systemUserCreated ? 'success' : 'warning',
            $systemUserCreated ? 'FTP user created successfully.' : 'FTP user created in DB, but system user creation failed.'
        );
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

        // Update password if provided
        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            // Update system user password
            $this->updateSystemUserPassword($ftpUser->username, $validated['password']);
        }

        // Update directory if changed
        if (isset($validated['domain_id']) && $validated['domain_id'] != $ftpUser->domain_id) {
            $domain = Domain::find($validated['domain_id']);
            if ($domain) {
                $validated['directory'] = '/var/www/' . $domain->domain_name;
                // Update system user home directory? Might need usermod.
            }
        }

        $ftpUser->update($validated);

        return redirect()->route('ftp.index')->with('success', 'FTP user updated successfully.');
    }

    /**
     * Remove the specified FTP user from storage.
     */
    public function destroy(FtpUser $ftpUser)
    {
        // Delete system user
        $this->deleteSystemUser($ftpUser->username);
        
        $ftpUser->delete();
        return redirect()->route('ftp.index')->with('success', 'FTP user deleted successfully.');
    }

    /**
     * Create a system user for FTP access
     */
    private function createSystemUser(string $username, string $password, string $directory): bool
    {
        // Create user with /usr/sbin/nologin shell (no SSH access)
        $command = sprintf(
            'sudo useradd -m -d %s -s /usr/sbin/nologin %s 2>&1',
            escapeshellarg($directory),
            escapeshellarg($username)
        );
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            Log::error("useradd failed for {$username}: " . implode("\n", $output));
            return false;
        }

        // Set password
        $passwordCommand = sprintf(
            'echo %s:%s | sudo chpasswd 2>&1',
            escapeshellarg($username),
            escapeshellarg($password)
        );
        exec($passwordCommand, $output2, $returnCode2);
        
        if ($returnCode2 !== 0) {
            Log::error("chpasswd failed for {$username}: " . implode("\n", $output2));
            // Try to remove the user we just created
            exec("sudo userdel {$username} 2>&1");
            return false;
        }

        // Set ownership of directory
        exec("sudo chown -R {$username}:{$username} " . escapeshellarg($directory) . " 2>&1", $output3, $returnCode3);
        if ($returnCode3 !== 0) {
            Log::warning("chown failed for {$directory}: " . implode("\n", $output3));
            // Not critical, continue
        }

        return true;
    }

    /**
     * Update system user password
     */
    private function updateSystemUserPassword(string $username, string $password): bool
    {
        $command = sprintf(
            'echo %s:%s | sudo chpasswd 2>&1',
            escapeshellarg($username),
            escapeshellarg($password)
        );
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            Log::error("Failed to update password for {$username}: " . implode("\n", $output));
            return false;
        }
        return true;
    }

    /**
     * Delete system user
     */
    private function deleteSystemUser(string $username): void
    {
        exec("sudo userdel -r {$username} 2>&1", $output, $returnCode);
        if ($returnCode !== 0) {
            Log::warning("Failed to delete system user {$username}: " . implode("\n", $output));
        }
    }
}
