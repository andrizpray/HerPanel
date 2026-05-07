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
        $emails = EmailAccount::with('domain')->get()->map(function ($email) {
            return [
                'id' => $email->id,
                'email' => $email->email,
                'domain_name' => $email->domain ? $email->domain->domain_name : null,
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
        $domains = Domain::all()->map(function ($domain) {
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
        ]);

        $domain = Domain::findOrFail($validated['domain_id']);
        $email = $validated['prefix'] . '@' . $domain->domain_name;

        // Check uniqueness
        if (EmailAccount::where('email', $email)->exists()) {
            return back()->withErrors(['prefix' => 'Email already exists.']);
        }

        // Generate password hash using doveadm
        $hash = shell_exec('doveadm pw -s SHA512-CRYPT -p ' . escapeshellarg($validated['password']) . ' 2>/dev/null');
        $hash = trim($hash);

        if (empty($hash)) {
            return back()->withErrors(['password' => 'Failed to generate password hash.']);
        }

        EmailAccount::create([
            'domain_id' => $validated['domain_id'],
            'email' => $email,
            'password' => $hash,
        ]);

        return Redirect::route('emails.index')->with('success', 'Email account created successfully.');
    }

    public function edit($id)
    {
        $email = EmailAccount::with('domain')->findOrFail($id);

        return Inertia::render('Emails/Edit', [
            'email' => [
                'id' => $email->id,
                'email' => $email->email,
                'domain_id' => $email->domain_id,
                'domain_name' => $email->domain ? $email->domain->domain_name : null,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $email = EmailAccount::findOrFail($id);

        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        // Generate password hash
        $hash = shell_exec('doveadm pw -s SHA512-CRYPT -p ' . escapeshellarg($validated['password']) . ' 2>/dev/null');
        $hash = trim($hash);

        if (empty($hash)) {
            return back()->withErrors(['password' => 'Failed to generate password hash.']);
        }

        $email->update(['password' => $hash]);

        return Redirect::route('emails.index')->with('success', 'Email password updated successfully.');
    }

    public function destroy($id)
    {
        $email = EmailAccount::findOrFail($id);
        $email->delete();

        return Redirect::route('emails.index')->with('success', 'Email account deleted successfully.');
    }
}
