<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\EmailAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class EmailController extends Controller
{
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
            'email' => 'required|email|unique:email_accounts,email',
            'password' => 'required|string|min:8',
            'quota_mb' => 'sometimes|integer|min:100',
        ]);

        // Check domain ownership
        $domain = Domain::where('user_id', Auth::id())
            ->where('id', $validated['domain_id'])
            ->firstOrFail();

        // Create full email address
        $emailParts = explode('@', $validated['email']);
        if (count($emailParts) === 1) {
            $validated['email'] = $validated['email'] . '@' . $domain->domain;
        }

        EmailAccount::create([
            'user_id' => Auth::id(),
            'domain_id' => $validated['domain_id'],
            'email' => $validated['email'],
            'password' => $validated['password'], // encrypted by mutator
            'quota_mb' => $validated['quota_mb'] ?? 1024,
            'is_active' => true,
        ]);

        // TODO: Create actual mailbox in Dovecot/Postfix

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

        return redirect()->route('emails.index')->with('success', 'Email password updated successfully.');
    }

    public function destroy(EmailAccount $emailAccount)
    {
        // Check ownership
        if ($emailAccount->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // TODO: Remove mailbox from Dovecot/Postfix

        $emailAccount->delete();

        return redirect()->route('emails.index')->with('success', 'Email account deleted successfully.');
    }
}
