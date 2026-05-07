<?php

namespace App\Services;

use App\Models\Domain;
use Illuminate\Support\Facades\Log;

class SslService
{
    /**
     * Generate SSL certificate using Certbot (webroot mode)
     */
    public function generateCertificate(Domain $domain): array
    {
        $domainName = $domain->domain_name;
        $webrootPath = '/var/www/herpanel/public';
        $email = config('app.ssl_email', 'herpanel.dev@gmail.com');

        // Create webroot directory for ACME challenge if not exists
        $challengeDir = "{$webrootPath}/.well-known/acme-challenge";
        if (!is_dir($challengeDir)) {
            exec("sudo /usr/bin/mkdir -p " . escapeshellarg($challengeDir));
            exec("sudo /usr/bin/chown -R www-data:www-data " . escapeshellarg($challengeDir));
        }

        // Certbot command (webroot mode - doesn't require stopping Nginx)
        $cmd = sprintf(
            'sudo /usr/bin/certbot certonly --webroot -w %s -d %s --non-interactive --agree-tos --email %s --keep-until-expiring 2>&1',
            escapeshellarg($webrootPath),
            escapeshellarg($domainName),
            escapeshellarg($email)
        );

        Log::info('SSL Generate Command', ['cmd' => $cmd, 'domain' => $domainName]);

        exec($cmd, $output, $returnCode);

        $outputStr = implode("\n", $output);

        if ($returnCode === 0) {
            // Certificate generated successfully
            $certPath = "/etc/letsencrypt/live/{$domainName}";
            return [
                'success' => true,
                'message' => 'SSL certificate generated successfully.',
                'output' => $outputStr,
                'cert_path' => $certPath,
            ];
        }

        // Check if certificate already exists
        if (strpos($outputStr, 'Certificate already exists') !== false) {
            return [
                'success' => true,
                'message' => 'SSL certificate already exists.',
                'output' => $outputStr,
            ];
        }

        return [
            'success' => false,
            'message' => 'Failed to generate SSL certificate.',
            'output' => $outputStr,
            'error_code' => $returnCode,
        ];
    }

    /**
     * Check SSL certificate status
     */
    public function checkCertificateStatus(Domain $domain): array
    {
        $domainName = $domain->domain_name;
        $certPath = "/etc/letsencrypt/live/{$domainName}";

        // Check if certificate exists
        if (!file_exists("{$certPath}/fullchain.pem")) {
            return [
                'status' => 'none',
                'message' => 'No SSL certificate found.',
            ];
        }

        // Get certificate expiry date
        $cmd = sprintf(
            'sudo /usr/bin/openssl x509 -in %s/fullchain.pem -noout -enddate 2>&1',
            escapeshellarg($certPath)
        );

        exec($cmd, $output, $returnCode);

        if ($returnCode !== 0) {
            return [
                'status' => 'error',
                'message' => 'Failed to read certificate.',
            ];
        }

        $outputStr = implode("\n", $output);
        
        // Parse expiry date (format: notAfter=Dec 31 23:59:59 2026 GMT)
        if (preg_match('/notAfter=(.+)/', $outputStr, $matches)) {
            $expiryDate = strtotime($matches[1]);
            $now = time();
            $daysLeft = ceil(($expiryDate - $now) / 86400);

            if ($daysLeft < 0) {
                return [
                    'status' => 'expired',
                    'message' => 'SSL certificate has expired.',
                    'expiry_date' => date('Y-m-d H:i:s', $expiryDate),
                    'days_left' => $daysLeft,
                ];
            }

            if ($daysLeft <= 30) {
                return [
                    'status' => 'expiring',
                    'message' => "SSL certificate expires in {$daysLeft} days.",
                    'expiry_date' => date('Y-m-d H:i:s', $expiryDate),
                    'days_left' => $daysLeft,
                ];
            }

            return [
                'status' => 'active',
                'message' => "SSL certificate is valid for {$daysLeft} days.",
                'expiry_date' => date('Y-m-d H:i:s', $expiryDate),
                'days_left' => $daysLeft,
            ];
        }

        return [
            'status' => 'error',
            'message' => 'Failed to parse certificate expiry date.',
        ];
    }

    /**
     * Renew all certificates (typically run via cron)
     */
    public function renewCertificates(): array
    {
        $cmd = 'sudo /usr/bin/certbot renew --non-interactive 2>&1';
        
        exec($cmd, $output, $returnCode);

        $outputStr = implode("\n", $output);

        return [
            'success' => $returnCode === 0,
            'output' => $outputStr,
            'return_code' => $returnCode,
        ];
    }

    /**
     * Revoke and delete certificate
     */
    public function revokeCertificate(Domain $domain): array
    {
        $domainName = $domain->domain_name;

        $cmd = sprintf(
            'sudo /usr/bin/certbot revoke --cert-path /etc/letsencrypt/live/%s/fullchain.pem --non-interactive 2>&1',
            escapeshellarg($domainName)
        );

        exec($cmd, $output, $returnCode);

        // Delete certificate files
        $deleteCmd = sprintf(
            'sudo /usr/bin/rm -rf /etc/letsencrypt/live/%s /etc/letsencrypt/archive/%s /etc/letsencrypt/renewal/%s.conf 2>&1',
            escapeshellarg($domainName),
            escapeshellarg($domainName),
            escapeshellarg($domainName)
        );

        exec($deleteCmd, $deleteOutput, $deleteReturnCode);

        return [
            'success' => $returnCode === 0,
            'message' => $returnCode === 0 ? 'SSL certificate revoked and deleted.' : 'Failed to revoke certificate.',
            'output' => implode("\n", $output),
        ];
    }
}
