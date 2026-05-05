<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DomainController extends Controller
{
    public function index()
    {
        $domains = Domain::where('user_id', auth()->id())->latest()->get();
        return Inertia::render('Domains/Index', [
            'domains' => $domains
        ]);
    }

    public function create()
    {
        return Inertia::render('Domains/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'domain_name' => 'required|string|unique:domains,domain_name',
        ]);

        Domain::create([
            'user_id' => auth()->id(),
            'domain_name' => $validated['domain_name'],
            'status' => 'active',
        ]);

        return redirect()->route('domains.index')->with('success', 'Domain added successfully.');
    }

    public function destroy($id)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($id);
        $domain->delete();

        return redirect()->route('domains.index')->with('success', 'Domain deleted successfully.');
    }
}
