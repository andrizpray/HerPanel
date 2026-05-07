<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\EmailAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class EmailController extends Controller
{
    public function index()
    {
        // Only show emails for domains owned by the authenticated user
        $emails = EmailAccount::with('domain')
            ->whereHas('domain', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->get()->map(function ($email) {
            return [
                'id' => $email->id,
                'email' => $email->email,
                'domain_name' => $email->domain ? $email->domain->domain_name : null,
                'quota_mb' => $email->quota_mb ?? 1024,
                'created_at' => $email->created_at->toISOString(),
            ];
        });

        $domains = Domain::all()->map(function ($domain) {
            return [
                'id' => $domain->id,
                'domain_name' => $domain->domain_name,
            ];
        });

        return Inertia::render('Emails/Index', [
            'emails' => $emails,
            'domains' => $domains,
        ]);
    }

    public function create()
    {
        $domains = Domain::where('user_id', auth()->id())->get()->map(function ($domain) {
            return [
                'id' => $domain->id,
                'domain_name' => $domain->domain_name,
            ];
        });

        return Inertia::render('Emails/Create', [
            'domains' => $domains,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'domain_id' => 'required|exists:domains,id',
            'prefix' => 'required|string|max:64',
            'password' => 'required|string|min:6',
            'quota_mb' => 'nullable|integer|min:100|max:10240',
        ]);

        // Verify domain ownership
        $domain = Domain::where('user_id', auth()->id())->findOrFail($validated['domain_id']);
        // Clean prefix: remove anything after @ to prevent double @
        $prefix = preg_replace('/@.*$/', '', $validated['prefix']);
        $email = $prefix . '@' . $domain->domain_name;

        // Check uniqueness
        if (EmailAccount::where('email', $email)->exists()) {
            return back()->withErrors(['prefix' => 'Email already exists.']);
        }

        // Generate SHA512-CRYPT hash using Dovecot's doveadm for 100% compatibility
        $passwordToStore = trim(shell_exec('doveadm pw -s SHA512-CRYPT -p ' . escapeshellarg($validated['password']) . ' 2>/dev/null'));
        // Remove {SHA512-CRYPT} prefix as Dovecot handles this via default_pass_scheme
        $passwordToStore = str_replace('{SHA512-CRYPT}', '', $passwordToStore);

        EmailAccount::create([
            'domain_id' => $validated['domain_id'],
            'email' => $email,
            'password' => $passwordToStore,
            'quota_mb' => $validated['quota_mb'] ?? 1024,
        ]);

        return Redirect::route('emails.index')->with('success', 'Email account created successfully.');
    }

    public function edit($id)
    {
        // Verify email account belongs to user's domain
        $email = EmailAccount::with('domain')
            ->whereHas('domain', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->findOrFail($id);

        return Inertia::render('Emails/Edit', [
            'email' => [
                'id' => $email->id,
                'email' => $email->email,
                'domain_id' => $email->domain_id,
                'domain_name' => $email->domain ? $email->domain->domain_name : null,
                'quota_mb' => $email->quota_mb ?? 1024,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        // Verify email account belongs to user's domain
        $email = EmailAccount::whereHas('domain', function ($query) {
            $query->where('user_id', auth()->id());
        })->findOrFail($id);

        $validated = $request->validate([
            'password' => 'nullable|string|min:6',
            'quota_mb' => 'nullable|integer|min:100|max:10240',
        ]);

        $data = [];

        if (!empty($validated['password'])) {
            // Generate SHA512-CRYPT hash using Dovecot's doveadm for 100% compatibility
            $passwordToStore = trim(shell_exec('doveadm pw -s SHA512-CRYPT -p ' . escapeshellarg($validated['password']) . ' 2>/dev/null'));
            // Remove {SHA512-CRYPT} prefix as Dovecot handles this via default_pass_scheme
            $data['password'] = str_replace('{SHA512-CRYPT}', '', $passwordToStore);
        }

        if (!empty($validated['quota_mb'])) {
            $data['quota_mb'] = $validated['quota_mb'];
        }

        $email->update($data);

        return Redirect::route('emails.index')->with('success', 'Email account updated successfully.');
    }

    public function destroy($id)
    {
        // Verify email account belongs to user's domain
        $email = EmailAccount::whereHas('domain', function ($query) {
            $query->where('user_id', auth()->id());
        })->findOrFail($id);
        $email->delete();

        return Redirect::route('emails.index')->with('success', 'Email account deleted successfully.');
    }
}
