<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FirewallController extends Controller
{
    public function index()
    {
        $rules = \App\Models\FirewallRule::where('user_id', auth()->id())
            ->with('domain')
            ->latest()
            ->get();

        return \Inertia\Inertia::render('Firewall/Index', [
            'rules' => $rules
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'domain_id' => 'nullable|exists:domains,id',
            'type' => 'required|in:allow,deny',
            'source' => 'required|string|max:255',
            'port' => 'nullable|string|max:50',
            'protocol' => 'required|in:tcp,udp,all',
            'description' => 'nullable|string|max:255',
        ]);

        \App\Models\FirewallRule::create([
            'user_id' => auth()->id(),
            ...$validated,
        ]);

        return redirect()->back()->with('success', 'Firewall rule added successfully.');
    }

    public function destroy($id)
    {
        $rule = \App\Models\FirewallRule::where('user_id', auth()->id())->findOrFail($id);
        $rule->delete();

        return redirect()->back()->with('success', 'Firewall rule deleted successfully.');
    }
}
