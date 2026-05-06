<?php

namespace App\Console\Commands;

use App\Models\CronJob;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Cron\CronExpression;

class ProcessCronJobs extends Command
{
    protected $signature = 'cron:process';
    protected $description = 'Process and execute due cron jobs from database';

    public function handle()
    {
        $this->info('[' . now() . '] Checking cron jobs...');

        $cronJobs = CronJob::where('is_active', true)->get();

        if ($cronJobs->isEmpty()) {
            $this->info('No active cron jobs found.');
            return;
        }

        $now = Carbon::now();
        $runCount = 0;

        foreach ($cronJobs as $job) {
            try {
                $cron = new CronExpression($job->schedule);
                
                // Check if job should run now (within the last minute)
                if ($cron->isDue($now)) {
                    $this->info("Running job #{$job->id}: {$job->command}");
                    
                    // Execute the command
                    exec($job->command . ' 2>&1', $output, $returnCode);
                    
                    // Update last_run_at
                    $job->update(['last_run_at' => $now]);
                    
                    $runCount++;
                    $this->info("Job #{$job->id} completed with exit code: {$returnCode}");
                }
            } catch (\Exception $e) {
                $this->error("Failed to run job #{$job->id}: " . $e->getMessage());
            }
        }

        $this->info("Total jobs executed: {$runCount}");
    }
}
