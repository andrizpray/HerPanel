<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\ErrorPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ErrorPageController extends Controller
{
    /**
     * Display a listing of error pages for a domain.
     */
    public function index($domainId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        
        return inertia('Domains/ErrorPages', [
            'domain' => $domain,
            'errorPages' => $domain->errorPages()->latest()->get(),
            'availableCodes' => $this->getAvailableCodes(),
        ]);
    }

    /**
     * Show the form for creating a new error page.
     */
    public function create($domainId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        
        return inertia('Domains/ErrorPages/Create', [
            'domain' => $domain,
            'errorCodes' => $this->getAvailableCodes(),
        ]);
    }

    /**
     * Store a newly created error page.
     */
    public function store(Request $request, $domainId)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        
        $validated = $request->validate([
            'error_code' => 'required|string|max:10',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        // Check if error page already exists for this domain + code
        $exists = $domain->errorPages()->where('error_code', $validated['error_code'])->exists();
        if ($exists) {
            return back()->with('error', 'Error page for this code already exists.');
        }

        $domain->errorPages()->create([
            'error_code' => $validated['error_code'],
            'content' => $validated['content'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        // Generate Nginx config
        $this->generateNginxConfig($domain);

        return redirect()->route('error-pages.index', $domainId)
            ->with('success', 'Error page created successfully.');
    }

    /**
     * Show the form for editing the specified error page.
     */
    public function edit($domainId, $id)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $errorPage = $domain->errorPages()->findOrFail($id);
        
        return inertia('Domains/ErrorPages/Edit', [
            'domain' => $domain,
            'errorPage' => $errorPage,
        ]);
    }

    /**
     * Update the specified error page.
     */
    public function update(Request $request, $domainId, $id)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $errorPage = $domain->errorPages()->findOrFail($id);
        
        $validated = $request->validate([
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $errorPage->update([
            'content' => $validated['content'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        // Regenerate Nginx config
        $this->generateNginxConfig($domain);

        return redirect()->route('error-pages.index', $domainId)
            ->with('success', 'Error page updated successfully.');
    }

    /**
     * Remove the specified error page.
     */
    public function destroy($domainId, $id)
    {
        $domain = Domain::where('user_id', auth()->id())->findOrFail($domainId);
        $errorPage = $domain->errorPages()->findOrFail($id);
        $errorCode = $errorPage->error_code;
        
        $errorPage->delete();

        // Regenerate Nginx config
        $this->generateNginxConfig($domain);

        return back()->with('success', "Error page {$errorCode} deleted successfully.");
    }

    /**
     * Preview error page (used by Nginx).
     * Note: This endpoint is intentionally public as it's called by Nginx
     * to serve custom error pages. Access is controlled by domain ownership
     * when creating/editing error pages.
     */
    public function preview($domainId, $errorCode)
    {
        $domain = Domain::findOrFail($domainId);
        $errorPage = $domain->errorPages()
            ->where('error_code', $errorCode)
            ->where('is_active', true)
            ->first();
        
        if (!$errorPage) {
            abort((int) $errorCode);
        }

        return response($errorPage->content)->header('Content-Type', 'text/html');
    }

    /**
     * Get available error codes.
     */
    private function getAvailableCodes(): array
    {
        return [
            ['code' => '403', 'name' => '403 Forbidden'],
            ['code' => '404', 'name' => '404 Not Found'],
            ['code' => '500', 'name' => '500 Internal Server Error'],
            ['code' => '502', 'name' => '502 Bad Gateway'],
            ['code' => '503', 'name' => '503 Service Unavailable'],
            ['code' => '504', 'name' => '504 Gateway Timeout'],
        ];
    }

    /**
     * Generate Nginx error page configuration.
     */
    private function generateNginxConfig(Domain $domain): void
    {
        try {
            $errorPages = $domain->errorPages()->where('is_active', true)->get();
            
            if ($errorPages->isEmpty()) {
                // Remove config if no active error pages
                $configPath = "/etc/nginx/snippets/error-pages-{$domain->id}.conf";
                if (file_exists($configPath)) {
                    @unlink($configPath);
                }
                return;
            }

            $config = "# Error Pages Configuration for {$domain->domain_name}\n";
            $config .= "error_page ";
            $config .= $errorPages->pluck('error_code')->implode(', ');
            $config .= " @custom_error;\n\n";
            $config .= "location @custom_error {\n";
            $config .= "    internal;\n";
            $config .= "    proxy_intercept_errors on;\n";
            $config .= "    default_type text/html;\n";
            $config .= "    return 200 \"\";\n"; // Placeholder - will be replaced with actual content
            $config .= "}\n";

            // Write config snippet
            $configPath = "/etc/nginx/snippets/error-pages-{$domain->id}.conf";
            file_put_contents($configPath, $config);
            
            // Reload Nginx
            shell_exec('sudo nginx -t && sudo systemctl reload nginx 2>&1');
            
        } catch (\Exception $e) {
            Log::error('Failed to generate Nginx error page config', [
                'domain' => $domain->domain_name,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
