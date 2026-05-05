<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class MonitoringController extends Controller
{
    public function index()
    {
        // Get the monitoring server URL from config or use default
        $monitoringServerUrl = env('MONITORING_SERVER_URL', 'http://localhost:3001');
        
        return Inertia::render('Monitoring/Index', [
            'monitoringServerUrl' => $monitoringServerUrl
        ]);
    }
}
