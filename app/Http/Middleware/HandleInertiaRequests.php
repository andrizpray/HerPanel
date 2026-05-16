<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $serverIp = config('app.server_ip');
        if (!$serverIp) {
            $detectedIp = trim(shell_exec('curl -s ifconfig.me 2>/dev/null') ?: '');
            $serverIp = filter_var($detectedIp, FILTER_VALIDATE_IP) ? $detectedIp : 'YOUR_SERVER_IP';
        }
        
        $serverHost = trim(shell_exec('hostname 2>/dev/null') ?: 'localhost');
        
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'serverIp' => $serverIp,
            'serverHost' => $serverHost,
        ];
    }
}
