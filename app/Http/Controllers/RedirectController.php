<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\RedirectRule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RedirectController extends Controller
{
    public function index($domainId)
    {
        $domain = Domain::with(['redirectRules' => function ($query) {
            $query->orderBy('priority', 'asc');
        }])->findOrFail($domainId);

        return Inertia::render('Domains/Redirects/Index', [
            'domain' => $domain,
            'redirects' => $domain->redirectRules,
        ]);
    }

    public function create($domainId)
    {
        $domain = Domain::findOrFail($domainId);

        return Inertia::render('Domains/Redirects/Create', [
            'domain' => $domain,
        ]);
    }

    public function store(Request $request, $domainId)
    {
        $domain = Domain::findOrFail($domainId);

        $validated = $request->validate([
            'source_path' => 'required|string|max:500',
            'destination_url' => 'required|string|max:500',
            'redirect_type' => 'required|in:301,302,307,308',
            'is_active' => 'boolean',
            'priority' => 'integer|min:0',
        ]);

        $domain->redirectRules()->create($validated);

        return redirect()->route('redirects.index', $domainId)
            ->with('success', 'Redirect rule added successfully.');
    }

    public function edit($domainId, $id)
    {
        $domain = Domain::findOrFail($domainId);
        $redirect = $domain->redirectRules()->findOrFail($id);

        return Inertia::render('Domains/Redirects/Edit', [
            'domain' => $domain,
            'redirect' => $redirect,
        ]);
    }

    public function update(Request $request, $domainId, $id)
    {
        $domain = Domain::findOrFail($domainId);
        $redirect = $domain->redirectRules()->findOrFail($id);

        $validated = $request->validate([
            'source_path' => 'required|string|max:500',
            'destination_url' => 'required|string|max:500',
            'redirect_type' => 'required|in:301,302,307,308',
            'is_active' => 'boolean',
            'priority' => 'integer|min:0',
        ]);

        $redirect->update($validated);

        return redirect()->route('redirects.index', $domainId)
            ->with('success', 'Redirect rule updated successfully.');
    }

    public function destroy($domainId, $id)
    {
        $domain = Domain::findOrFail($domainId);
        $redirect = $domain->redirectRules()->findOrFail($id);

        $redirect->delete();

        return redirect()->route('redirects.index', $domainId)
            ->with('success', 'Redirect rule deleted successfully.');
    }
}
