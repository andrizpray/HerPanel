<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\EmailAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EmailController extends Controller
{
    /**
     * Generate Dovecot-compatible password hash (SHA512-CRYPT)
     */
    private function hashPasswordForDovecot($password)
    {
        // Generate salt and create SHA512-CRYPT hash compatible with Dovecot
        $salt = substr(base64_encode(random_bytes(16)), 0, 16);
        $hash = crypt($password, '$6$' . $salt . '$');
        return '{SHA512-CRYPT}' . $hash;
    }

    /**
     * Sync email account to Dovecot virtual_users table
     */
    private function syncToDovecot($email, $password, $quota_mb, $domainName, $operation = 'create')
    {
        try {
            // Get or create virtual_domain
            $domainId = DB::connection('mysql')->table('virtual_domains')
                ->where('name', $domainName)
                ->value('id');

            if (!$domainId) {
                $domainId = DB::connection('mysql')->table('virtual_domains')
                    ->insertGetId(['name' => $domainName, 'created_at' => now(), 'updated_at' => now()]);
            }

            $dovecotPassword = $this->hashPasswordForDovecot($password);

            if ($operation === 'create') {
                DB::connection('mysql')->table('virtual_users')
                    ->insertOrIgnore([
                        'domain_id' => $domainId,
                        'email' => $email,
                        'password' => $dovecotPassword,
                        'quota_mb' => $quota_mb,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
            } else {
                DB::connection('mysql')->table('virtual_users')
                    ->where('email', $email)
                    ->update([
                        'password' => $dovecotPassword,
                        'quota_mb' => $quota_mb,
                        'updated_at' => now(),
                    ]);
            }

            // Create mailbox directory
            $mailDir = '/var/mail/vhosts/' . $domainName . '/' . explode('@', $email)[0];
            if (!is_dir($mailDir)) {
                mkdir($mailDir, 0775, true);
                chown($mailDir, 'vmail');
                chgrp($mailDir, 'vmail');
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Dovecot sync failed: ' . $e->getMessage());
            return false;
        }
    }

    public function index()
    {
        $emailAccounts = EmailAccount::with('domain')
            ->where('user_id', Auth::id())
            ->get();
        
        return inertia('Emails/Index', [
            'emailAccounts' => $emailAccounts,
        ]);
    }

    public function create()
    {
        $domains = Domain::where('user_id', Auth::id())->get();
        
        return inertia('Emails/Create', [
            'domains' => $domains,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'domain_id' => 'required|exists:domains,id',
            'email' => 'required|string|max:64',
            'password' => 'required|string|min:8',
            'quota_mb' => 'sometimes|integer|min:100',
        ]);

        // Check domain ownership
        $domain = Domain::where('user_id', Auth::id())
            ->where('id', $validated['domain_id'])
            ->firstOrFail();

        // Create full email address
        $fullEmail = $validated['email'];
        if (strpos($fullEmail, '@') === false) {
            $fullEmail = $fullEmail . '@' . $domain->domain_name;
        }

        // Check uniqueness of full email
        if (EmailAccount::where('email', $fullEmail)->exists()) {
            return back()->withErrors(['email' => 'This email address already exists.'])->withInput();
        }

        $emailAccount = EmailAccount::create([
            'user_id' => Auth::id(),
            'domain_id' => $validated['domain_id'],
            'email' => $fullEmail,
            'password' => $validated['password'], // encrypted by mutator
            'quota_mb' => $validated['quota_mb'] ?? 1024,
            'is_active' => true,
        ]);

        // Sync to Dovecot
        $this->syncToDovecot(
            $fullEmail,
            $validated['password'],
            $validated['quota_mb'] ?? 1024,
            $domain->domain_name,
            'create'
        );

        return redirect()->route('emails.index')->with('success', 'Email account created successfully.');
    }

    public function edit(EmailAccount $emailAccount)
    {
        // Check ownership
        if ($emailAccount->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        return inertia('Emails/Edit', [
            'emailAccount' => $emailAccount,
        ]);
    }

    public function update(Request $request, EmailAccount $emailAccount)
    {
        // Check ownership
        if ($emailAccount->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $emailAccount->update([
            'password' => $validated['password'], // encrypted by mutator
        ]);

        // Sync password to Dovecot
        $domain = $emailAccount->domain;
        $this->syncToDovecot(
            $emailAccount->email,
            $validated['password'],
            $emailAccount->quota_mb,
            $domain->domain_name,
            'update'
        );

        return redirect()->route('emails.index')->with('success', 'Email password updated successfully.');
    }

    public function destroy(EmailAccount $emailAccount)
    {
        // Check ownership
        if ($emailAccount->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Remove from Dovecot virtual_users
        try {
            DB::connection('mysql')->table('virtual_users')
                ->where('email', $emailAccount->email)
                ->delete();
        } catch (\Exception $e) {
            Log::error('Failed to remove from Dovecot: ' . $e->getMessage());
        }

        $emailAccount->delete();

        return redirect()->route('emails.index')->with('success', 'Email account deleted successfully.');
    }
}
