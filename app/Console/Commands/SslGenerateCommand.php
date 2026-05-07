<?php

namespace App\Console\Commands;

use App\Models\Domain;
use App\Services\SslService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('ssl:generate {domain_id? : Domain ID to generate SSL for (optional, generates for all active domains if omitted)}')]
#[Description('Generate SSL certificates for domains using Certbot')]
class SslGenerateCommand extends Command
{
    protected $signature = 'ssl:generate {domain_id?}';
    protected $description = 'Generate SSL certificates for domains using Certbot';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sslService = new SslService();
        $domainId = $this->argument('domain_id');

        if ($domainId) {
            // Generate SSL for specific domain
            $domain = Domain::find($domainId);
            
            if (!$domain) {
                $this->error("Domain with ID {$domainId} not found.");
                return 1;
            }

            $this->info("Generating SSL certificate for: {$domain->domain_name}");
            
            $result = $sslService->generateCertificate($domain);
            
            if ($result['success']) {
                $this->info($result['message']);
                
                // Update domain SSL status
                $status = $sslService->checkCertificateStatus($domain);
                $domain->update([
                    'ssl_status' => $status['status'],
                    'ssl_valid_from' => $status['expiry_date'] ?? null,
                    'ssl_valid_to' => $status['expiry_date'] ?? null,
                ]);
                
                return 0;
            } else {
                $this->error($result['message']);
                $this->line($result['output']);
                return 1;
            }
        } else {
            // Generate SSL for all active domains without SSL
            $domains = Domain::where('status', 'active')
                ->where(function ($query) {
                    $query->where('ssl_status', 'none')
                          ->orWhere('ssl_status', 'expired')
                          ->orWhereNull('ssl_status');
                })
                ->get();

            if ($domains->isEmpty()) {
                $this->info('No domains need SSL certificate generation.');
                return 0;
            }

            $this->info("Found {$domains->count()} domain(s) to generate SSL certificates for.");
            
            $successCount = 0;
            $failCount = 0;

            foreach ($domains as $domain) {
                $this->line("Processing: {$domain->domain_name}");
                
                $result = $sslService->generateCertificate($domain);
                
                if ($result['success']) {
                    $this->info("  ✓ {$result['message']}");
                    $successCount++;
                    
                    // Update domain SSL status
                    $status = $sslService->checkCertificateStatus($domain);
                    $domain->update([
                        'ssl_status' => $status['status'],
                        'ssl_valid_from' => $status['expiry_date'] ?? null,
                        'ssl_valid_to' => $status['expiry_date'] ?? null,
                    ]);
                } else {
                    $this->error("  ✗ {$result['message']}");
                    $failCount++;
                }
            }

            $this->info("SSL generation complete: {$successCount} success, {$failCount} failed.");
            
            return $failCount > 0 ? 1 : 0;
        }
    }
}
