<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('firewall:apply')]
#[Description('Apply firewall rules from database to UFW/iptables')]
class FirewallApplyCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Applying firewall rules...');
        
        $results = \App\Services\FirewallService::applyRules();
        
        foreach ($results as $result) {
            if ($result['success']) {
                $this->info("✓ Rule {$result['rule_id']}: {$result['command']}");
            } else {
                $this->error("✗ Rule {$result['rule_id']} failed (code: {$result['return_code']})");
                $this->line("  Output: " . substr($result['output'], 0, 200));
            }
        }
        
        $this->info('Done!');
    }
}
