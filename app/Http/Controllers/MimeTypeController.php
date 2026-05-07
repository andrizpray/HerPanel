<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\MimeType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MimeTypeController extends Controller
{
    public function index($domainId)
    {
        // Verify domain ownership
        $domain = Domain::where('user_id', auth()->id())
            ->with('mimeTypes')
            ->findOrFail($domainId);
        
        return Inertia::render('Domains/MimeTypes/Index', [
            'domain' => $domain,
            'mimeTypes' => $domain->mimeTypes,
        ]);
    }

    public function create($domainId)
    {
        // Verify domain ownership
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        
        // Common MIME types for suggestions
        $commonMimeTypes = [
            'text/css' => 'CSS',
            'text/javascript' => 'JavaScript',
            'application/javascript' => 'JavaScript (Application)',
            'image/jpeg' => 'JPEG Image',
            'image/png' => 'PNG Image',
            'image/gif' => 'GIF Image',
            'image/webp' => 'WebP Image',
            'application/pdf' => 'PDF Document',
            'application/json' => 'JSON',
            'text/plain' => 'Plain Text',
            'text/html' => 'HTML',
            'application/xml' => 'XML',
            'font/woff2' => 'WOFF2 Font',
        ];
        
        return Inertia::render('Domains/MimeTypes/Create', [
            'domain' => $domain,
            'commonMimeTypes' => $commonMimeTypes,
        ]);
    }

    public function store(Request $request, $domainId)
    {
        // Verify domain ownership
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        
        $validated = $request->validate([
            'extension' => 'required|string|max:50',
            'mime_type' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);
        
        $domain->mimeTypes()->create($validated);
        
        return redirect()->route('mime-types.index', $domainId)
            ->with('success', 'MIME type added successfully.');
    }

    public function edit($domainId, $id)
    {
        // Verify domain ownership
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $mimeType = $domain->mimeTypes()->findOrFail($id);
        
        return Inertia::render('Domains/MimeTypes/Edit', [
            'domain' => $domain,
            'mimeType' => $mimeType,
        ]);
    }

    public function update(Request $request, $domainId, $id)
    {
        // Verify domain ownership
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $mimeType = $domain->mimeTypes()->findOrFail($id);
        
        $validated = $request->validate([
            'extension' => 'required|string|max:50',
            'mime_type' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);
        
        $mimeType->update($validated);
        
        return redirect()->route('mime-types.index', $domainId)
            ->with('success', 'MIME type updated successfully.');
    }

    public function destroy($domainId, $id)
    {
        // Verify domain ownership
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $mimeType = $domain->mimeTypes()->findOrFail($id);
        
        $mimeType->delete();
        
        return redirect()->route('mime-types.index', $domainId)
            ->with('success', 'MIME type deleted successfully.');
    }
}
