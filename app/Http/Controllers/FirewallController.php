<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FirewallService;

class FirewallController extends Controller
{
    public function index()
    {
        $rules = \App\Models\FirewallRule::where('user_id', auth()->id())
            ->with('domain')
            ->latest()
            ->get();

        // Get UFW status for display
        $ufwStatus = FirewallService::getUfwStatus();

        return \Inertia\Inertia::render('Firewall/Index', [
            'rules' => $rules,
            'ufw_status' => $ufwStatus,
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

        // Apply rules to firewall
        FirewallService::applyRules();

        return redirect()->back()->with('success', 'Firewall rule added and applied successfully.');
    }

    public function destroy($id)
    {
        $rule = \App\Models\FirewallRule::where('user_id', auth()->id())->findOrFail($id);
        $rule->delete();

        // Apply rules to firewall
        FirewallService::applyRules();

        return redirect()->back()->with('success', 'Firewall rule deleted and firewall updated.');
    }

    public function apply()
    {
        $results = FirewallService::applyRules();
        
        $successCount = count(array_filter($results, fn($r) => $r['success']));
        $total = count($results);
        
        if ($successCount === $total) {
            return redirect()->back()->with('success', "All {$total} firewall rules applied successfully.");
        } else {
            return redirect()->back()->with('error', "Applied {$successCount} of {$total} rules. Check logs.");
        }
    }
}
