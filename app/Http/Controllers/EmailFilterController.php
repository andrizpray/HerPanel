<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\EmailAccount;
use App\Models\EmailFilter;
use App\Models\SpamSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class EmailFilterController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $filters = EmailFilter::with(['domain', 'email'])
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($filter) {
                return [
                    'id' => $filter->id,
                    'name' => $filter->name,
                    'domain_name' => $filter->domain ? $filter->domain->domain_name : null,
                    'email_email' => $filter->email ? $filter->email->email : null,
                    'conditions' => $filter->conditions,
                    'actions' => $filter->actions,
                    'is_active' => $filter->is_active,
                    'created_at' => $filter->created_at->toISOString(),
                ];
            });

        $spamSettings = SpamSetting::with(['domain', 'email'])
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($setting) {
                return [
                    'id' => $setting->id,
                    'domain_name' => $setting->domain ? $setting->domain->domain_name : null,
                    'email_email' => $setting->email ? $setting->email->email : null,
                    'spam_threshold' => $setting->spam_threshold,
                    'action_on_spam' => $setting->action_on_spam,
                    'is_active' => $setting->is_active,
                ];
            });

        $domains = Domain::where('user_id', $user->id)->get(['id', 'domain_name']);
        $emails = EmailAccount::whereIn('domain_id', $domains->pluck('id'))->get(['id', 'email']);

        return Inertia::render('Emails/Filters/Index', [
            'filters' => $filters,
            'spamSettings' => $spamSettings,
            'domains' => $domains,
            'emails' => $emails,
        ]);
    }

    public function storeFilter(Request $request)
    {
        $validated = $request->validate([
            'domain_id' => 'required|exists:domains,id',
            'email_id' => 'nullable|exists:virtual_users,id',
            'name' => 'required|string|max:255',
            'conditions' => 'required|json',
            'actions' => 'required|json',
        ]);

        // Verify domain ownership
        $domain = Domain::where('user_id', auth()->id())
            ->where('id', $validated['domain_id'])
            ->firstOrFail();

        // Verify email ownership if email_id is provided
        if (!empty($validated['email_id'])) {
            $email = EmailAccount::whereHas('domain', function ($query) {
                $query->where('user_id', auth()->id());
            })->where('id', $validated['email_id'])->firstOrFail();
        }

        EmailFilter::create([
            'user_id' => auth()->id(),
            'domain_id' => $validated['domain_id'],
            'email_id' => $validated['email_id'],
            'name' => $validated['name'],
            'conditions' => json_decode($validated['conditions'], true),
            'actions' => json_decode($validated['actions'], true),
        ]);

        return Redirect::route('email-filters.index')->with('success', 'Filter created successfully.');
    }

    public function deleteFilter($id)
    {
        $filter = EmailFilter::where('user_id', auth()->id())->findOrFail($id);
        $filter->delete();

        return Redirect::route('email-filters.index')->with('success', 'Filter deleted successfully.');
    }

    public function storeSpamSetting(Request $request)
    {
        $validated = $request->validate([
            'domain_id' => 'nullable|exists:domains,id',
            'email_id' => 'nullable|exists:virtual_users,id',
            'spam_threshold' => 'required|numeric|min:1|max:10',
            'action_on_spam' => 'required|in:move_to_junk,delete,flag',
        ]);

        // Verify domain ownership if domain_id is provided
        if (!empty($validated['domain_id'])) {
            $domain = Domain::where('user_id', auth()->id())
                ->where('id', $validated['domain_id'])
                ->firstOrFail();
        }

        // Verify email ownership if email_id is provided
        if (!empty($validated['email_id'])) {
            $email = EmailAccount::whereHas('domain', function ($query) {
                $query->where('user_id', auth()->id());
            })->where('id', $validated['email_id'])->firstOrFail();
        }

        SpamSetting::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'domain_id' => $validated['domain_id'],
                'email_id' => $validated['email_id'],
            ],
            [
                'spam_threshold' => $validated['spam_threshold'],
                'action_on_spam' => $validated['action_on_spam'],
                'is_active' => true,
            ]
        );

        return Redirect::route('email-filters.index')->with('success', 'Spam settings updated successfully.');
    }
}
