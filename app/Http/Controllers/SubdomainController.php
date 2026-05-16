<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\Subdomain;
use App\Models\DnsRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubdomainController extends Controller
{
    /**
     * Display a listing of subdomains for a domain.
     */
    public function index($domainId)
    {
        $domain = Domain::where('user_id', auth()->id())->with('subdomains')->findOrFail($domainId);
        
        return Inertia::render('Domains/Subdomains', [
            'domain' => $domain,
            'subdomains' => $domain->subdomains()->latest()->get(),
        ]);
    }

    /**
     * Store a newly created subdomain.
     */
    public function store(Request $request, $domainId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        
        $validated = $request->validate([
            'name' => 'required|string|max:253|regex:/^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?$/',
        ]);

        // Check if subdomain already exists
        $exists = $domain->subdomains()->where('name', $validated['name'])->exists();
        if ($exists) {
            return back()->with('error', 'Subdomain already exists.');
        }

        // Create subdomain
        $subdomain = $domain->subdomains()->create([
            'name' => $validated['name'],
            'status' => 'active',
        ]);

        // Auto-create DNS A record for subdomain
        try {
            // Auto-detect server IP or use configured value
            $serverIp = config('app.server_ip');
            if (!$serverIp) {
                // Try to detect public IP
                $detectedIp = trim(shell_exec('curl -s ifconfig.me 2>/dev/null') ?: '');
                $serverIp = filter_var($detectedIp, FILTER_VALIDATE_IP) ? $detectedIp : '127.0.0.1';
            }
            $domain->dnsRecords()->create([
                'type' => 'A',
                'name' => $validated['name'],
                'content' => $serverIp,
                'ttl' => 3600,
                'priority' => null,
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to create DNS record for subdomain', [
                'subdomain' => $subdomain->full_name,
                'error' => $e->getMessage(),
            ]);
        }

        return back()->with('success', "Subdomain '{$validated['name']}' created successfully.");
    }

    /**
     * Remove the specified subdomain.
     */
    public function destroy($domainId, $id)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $subdomain = $domain->subdomains()->findOrFail($id);
        $subdomainName = $subdomain->name;

        // Delete associated DNS records
        $domain->dnsRecords()->where('name', $subdomainName)->where('type', 'A')->delete();

        $subdomain->delete();

        return back()->with('success', "Subdomain '{$subdomainName}' deleted successfully.");
    }
}