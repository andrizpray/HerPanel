<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class MonitoringController extends Controller
{
    public function index()
    {
        // Get the monitoring server URL and Prometheus URL from config
        $monitoringServerUrl = env('MONITORING_SERVER_URL', 'http://localhost:3001');
        $prometheusUrl = env('PROMETHEUS_URL', 'http://localhost:9090');

        return Inertia::render('Monitoring/Index', [
            'monitoringServerUrl' => $monitoringServerUrl,
            'prometheusUrl' => $prometheusUrl
        ]);
    }
}
