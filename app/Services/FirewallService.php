<?php

namespace App\Services;

use App\Models\FirewallRule;

class FirewallService
{
    /**
     * Generate UFW commands from active firewall rules
     */
    public static function generateUfwCommands(): array
    {
        $rules = FirewallRule::where('is_active', true)->with('domain')->get();
        $commands = [];

        foreach ($rules as $rule) {
            $action = $rule->type === 'allow' ? 'allow' : 'deny';
            $source = $rule->source;
            
            // Build UFW command
            $cmd = "ufw {$action} from {$source}";
            
            if ($rule->port) {
                $cmd .= " to any port {$rule->port}";
            }
            
            if ($rule->protocol !== 'all') {
                $cmd .= " proto {$rule->protocol}";
            }
            
            $commands[] = [
                'rule_id' => $rule->id,
                'command' => $cmd,
                'description' => $rule->description,
            ];
        }

        return $commands;
    }

    /**
     * Generate iptables commands (alternative to UFW)
     */
    public static function generateIptablesCommands(): array
    {
        $rules = FirewallRule::where('is_active', true)->get();
        $commands = [];

        foreach ($rules as $rule) {
            $action = $rule->type === 'allow' ? 'ACCEPT' : 'DROP';
            $source = $rule->source;
            
            // Build iptables command
            $cmd = "iptables -A INPUT -s {$source}";
            
            if ($rule->protocol !== 'all') {
                $cmd .= " -p {$rule->protocol}";
            }
            
            if ($rule->port) {
                $cmd .= " --dport {$rule->port}";
            }
            
            $cmd .= " -j {$action}";
            
            $commands[] = [
                'rule_id' => $rule->id,
                'command' => $cmd,
                'description' => $rule->description,
            ];
        }

        return $commands;
    }

    /**
     * Apply all active rules to UFW
     */
    public static function applyRules(): array
    {
        $results = [];
        
        // Reset UFW to clean state (keeps SSH, HTTP, HTTPS)
        self::resetUfw();
        
        $commands = self::generateUfwCommands();
        
        foreach ($commands as $item) {
            $output = [];
            $returnCode = 0;
            
            // Execute with sudo (requires proper sudoers config)
            exec("sudo " . escapeshellcmd($item['command']), $output, $returnCode);
            
            $results[] = [
                'rule_id' => $item['rule_id'],
                'command' => $item['command'],
                'success' => $returnCode === 0,
                'output' => implode("\n", $output),
                'return_code' => $returnCode,
            ];
        }

        return $results;
    }

    /**
     * Get current UFW status
     */
    public static function getUfwStatus(): string
    {
        $output = [];
        exec('sudo ufw status verbose', $output);
        return implode("\n", $output);
    }

    /**
     * Reset UFW (delete all rules, keep SSH)
     */
    public static function resetUfw(): void
    {
        exec('sudo ufw --force reset');
        exec('sudo ufw default deny incoming');
        exec('sudo ufw default allow outgoing');
        exec('sudo ufw allow 22/tcp comment "SSH"'); // Keep SSH access
        exec('sudo ufw allow 443/tcp comment "HTTPS"');
        exec('sudo ufw allow 80/tcp comment "HTTP"');
        exec('sudo ufw --force enable');
    }
}
