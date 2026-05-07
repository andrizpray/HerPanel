<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\HotlinkProtection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HotlinkProtectionController extends Controller
{
    public function index($domainId)
    {
        $domain = Domain::with('hotlinkProtection')->findOrFail($domainId);
        
        $protection = $domain->hotlinkProtection;
        
        // Default values if not set
        $allowedDomains = $protection ? ($protection->allowed_domains ?? []) : [];
        $protectedExtensions = $protection ? ($protection->protected_extensions ?? []) : [];
        
        return Inertia::render('Domains/HotlinkProtection/Index', [
            'domain' => $domain,
            'protection' => $protection,
            'allowedDomains' => $allowedDomains,
            'protectedExtensions' => $protectedExtensions,
        ]);
    }

    public function update(Request $request, $domainId)
    {
        $domain = Domain::findOrFail($domainId);
        
        $validated = $request->validate([
            'is_enabled' => 'boolean',
            'allowed_domains' => 'nullable|string',
            'protected_extensions' => 'nullable|string',
            'redirect_url' => 'nullable|url',
        ]);
        
        $allowedDomains = [];
        if (!empty($validated['allowed_domains'])) {
            $allowedDomains = array_map('trim', explode("\n", $validated['allowed_domains']));
            $allowedDomains = array_filter($allowedDomains);
        }
        
        $protectedExtensions = [];
        if (!empty($validated['protected_extensions'])) {
            $protectedExtensions = array_map('trim', explode("\n", $validated['protected_extensions']));
            $protectedExtensions = array_filter($protectedExtensions);
            // Add dot prefix if not present
            $protectedExtensions = array_map(function($ext) {
                return strpos($ext, '.') === 0 ? $ext : '.' . $ext;
            }, $protectedExtensions);
        }
        
        $protection = $domain->hotlinkProtection;
        
        if ($protection) {
            $protection->update([
                'is_enabled' => $request->boolean('is_enabled'),
                'allowed_domains' => $allowedDomains,
                'protected_extensions' => $protectedExtensions,
                'redirect_url' => $validated['redirect_url'] ?: null,
            ]);
        } else {
            $domain->hotlinkProtection()->create([
                'is_enabled' => $request->boolean('is_enabled'),
                'allowed_domains' => $allowedDomains,
                'protected_extensions' => $protectedExtensions,
                'redirect_url' => $validated['redirect_url'] ?: null,
            ]);
        }
        
        return redirect()->route('hotlink-protection.index', $domainId)
            ->with('success', 'Hotlink protection settings updated successfully.');
    }
}
