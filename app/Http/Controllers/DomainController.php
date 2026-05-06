<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\DnsRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DomainController extends Controller
{
    public function index()
    {
        \Log::info('DomainController@index called', ['user_id' => auth()->id()]);
        $domains = Domain::where('user_id', auth()->id())->with('dnsRecords')->latest()->get();
        \Log::info('Domains found', ['count' => $domains->count()]);
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

    // DNS Records Management
    public function dnsIndex($domainId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $records = $domain->dnsRecords()->latest()->get();
        
        return response()->json(['records' => $records]);
    }

    public function dnsStore(Request $request, $domainId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        
        $validated = $request->validate([
            'type' => 'required|string|in:A,AAAA,CNAME,MX,TXT,NS,SRV',
            'name' => 'required|string',
            'content' => 'required|string',
            'ttl' => 'integer|min:60|max:86400',
            'priority' => 'nullable|integer',
        ]);

        $domain->dnsRecords()->create($validated);

        return back()->with('success', 'DNS record added successfully.');
    }

    public function dnsDestroy($domainId, $recordId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $record = $domain->dnsRecords()->findOrFail($recordId);
        $record->delete();

        return back()->with('success', 'DNS record deleted successfully.');
    }

    public function dnsUpdate(Request $request, $domainId, $recordId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $record = $domain->dnsRecords()->findOrFail($recordId);
        
        $validated = $request->validate([
            'type' => 'required|string|in:A,AAAA,CNAME,MX,TXT,NS',
            'name' => 'required|string',
            'content' => 'required|string',
            'ttl' => 'integer|min:60|max:86400',
            'priority' => 'nullable|integer',
        ]);

        $record->update($validated);

        return back()->with('success', 'DNS record updated successfully.');
    }

    // SSL Management
    public function checkSsl($domainId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        
        // Simulate SSL check (in real implementation, use lego, certbot, or ACME client)
        // For now, we'll just update the status
        $domain->update([
            'ssl_status' => 'pending',
            'ssl_valid_from' => null,
            'ssl_valid_to' => null,
        ]);

        return back()->with('success', 'SSL certificate request initiated.');
    }

    public function updateSslStatus(Request $request, $domainId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        
        $validated = $request->validate([
            'ssl_status' => 'required|in:none,pending,active,expired',
            'ssl_issuer' => 'nullable|string',
            'ssl_valid_from' => 'nullable|date',
            'ssl_valid_to' => 'nullable|date',
        ]);

        $domain->update($validated);

        return back()->with('success', 'SSL status updated successfully.');
    }
}
