<?php

use App\Http\Controllers\BackupController;
use App\Http\Controllers\DatabaseManagementController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\FileManagerController;
use App\Http\Controllers\FirewallController;
use App\Http\Controllers\SubdomainController;
use App\Http\Controllers\MimeTypeController;
use App\Http\Controllers\HotlinkProtectionController;
use App\Http\Controllers\RedirectController;
use App\Http\Controllers\ErrorPageController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CronJobController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/dashboard', function () {
    $domains = \App\Models\Domain::where('user_id', auth()->id())->latest()->get();
    return Inertia::render('Dashboard', [
        'domains' => $domains
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');


// Public Error Page Preview (for Nginx)
Route::get('/error-preview/{domainId}/{errorCode}', [ErrorPageController::class, 'preview'])->name('error.preview');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Domains
    Route::get('/domains', [DomainController::class, 'index'])->name('domains.index');
    Route::get('/domains/create', [DomainController::class, 'create'])->name('domains.create');
    Route::post('/domains', [DomainController::class, 'store'])->name('domains.store');
    Route::delete('/domains/{id}', [DomainController::class, 'destroy'])->name('domains.destroy');
    
    // DNS Records (nested under domains)
    Route::get('/domains/{domainId}/dns', [DomainController::class, 'dnsIndex'])->name('domains.dns.index');
    Route::post('/domains/{domainId}/dns', [DomainController::class, 'dnsStore'])->name('domains.dns.store');
    Route::put('/domains/{domainId}/dns/{recordId}', [DomainController::class, 'dnsUpdate'])->name('domains.dns.update');
    Route::delete('/domains/{domainId}/dns/{recordId}', [DomainController::class, 'dnsDestroy'])->name('domains.dns.destroy');
    
    // Subdomains Management (nested under domains)
    Route::get('/domains/{domainId}/subdomains', [SubdomainController::class, 'index'])->name('domains.subdomains.index');
    Route::post('/domains/{domainId}/subdomains', [SubdomainController::class, 'store'])->name('domains.subdomains.store');
    Route::delete('/domains/{domainId}/subdomains/{id}', [SubdomainController::class, 'destroy'])->name('domains.subdomains.destroy');


    // Error Pages Management (nested under domains)
    Route::get('/domains/{domainId}/error-pages', [ErrorPageController::class, 'index'])->name('error-pages.index');
    Route::get('/domains/{domainId}/error-pages/create', [ErrorPageController::class, 'create'])->name('error-pages.create');
    Route::post('/domains/{domainId}/error-pages', [ErrorPageController::class, 'store'])->name('error-pages.store');
    Route::get('/domains/{domainId}/error-pages/{id}/edit', [ErrorPageController::class, 'edit'])->name('error-pages.edit');
    Route::put('/domains/{domainId}/error-pages/{id}', [ErrorPageController::class, 'update'])->name('error-pages.update');
    Route::delete('/domains/{domainId}/error-pages/{id}', [ErrorPageController::class, 'destroy'])->name('error-pages.destroy');

    Route::get('/domains/{domainId}/mime-types', [MimeTypeController::class, 'index'])->name('mime-types.index');
    Route::get('/domains/{domainId}/mime-types/create', [MimeTypeController::class, 'create'])->name('mime-types.create');
    Route::post('/domains/{domainId}/mime-types', [MimeTypeController::class, 'store'])->name('mime-types.store');
    Route::get('/domains/{domainId}/mime-types/{id}/edit', [MimeTypeController::class, 'edit'])->name('mime-types.edit');
    Route::put('/domains/{domainId}/mime-types/{id}', [MimeTypeController::class, 'update'])->name('mime-types.update');
    Route::delete('/domains/{domainId}/mime-types/{id}', [MimeTypeController::class, 'destroy'])->name('mime-types.destroy');
    // Hotlink Protection Routes
    Route::get('/domains/{domainId}/hotlink-protection', [HotlinkProtectionController::class, 'index'])->name('hotlink-protection.index');
    Route::post('/domains/{domainId}/hotlink-protection', [HotlinkProtectionController::class, 'update'])->name('hotlink-protection.update');
    // Redirect Manager Routes
    Route::get('/domains/{domainId}/redirects', [RedirectController::class, 'index'])->name('redirects.index');
    Route::get('/domains/{domainId}/redirects/create', [RedirectController::class, 'create'])->name('redirects.create');
    Route::post('/domains/{domainId}/redirects', [RedirectController::class, 'store'])->name('redirects.store');
    Route::get('/domains/{domainId}/redirects/{id}/edit', [RedirectController::class, 'edit'])->name('redirects.edit');
    Route::put('/domains/{domainId}/redirects/{id}', [RedirectController::class, 'update'])->name('redirects.update');
    Route::delete('/domains/{domainId}/redirects/{id}', [RedirectController::class, 'destroy'])->name('redirects.destroy');

    // SSL Management
    Route::post('/domains/{id}/ssl/check', [DomainController::class, 'checkSsl'])->name('domains.ssl.check');
    Route::post('/domains/{id}/ssl/update', [DomainController::class, 'updateSslStatus'])->name('domains.ssl.update');
    
    // PHP Version Management
    Route::post('/domains/{id}/php-version', [DomainController::class, 'updatePhpVersion'])->name('domains.php-version');

    // File Manager
    Route::get('/file-manager', [FileManagerController::class, 'index'])->name('file-manager.index');
    Route::post('/file-manager/upload', [FileManagerController::class, 'store'])->name('file-manager.upload');
    Route::post('/file-manager/mkdir', [FileManagerController::class, 'mkdir'])->name('file-manager.mkdir');
    Route::delete('/file-manager/delete', [FileManagerController::class, 'delete'])->name('file-manager.delete');
    Route::get('/file-manager/preview', [FileManagerController::class, 'preview'])->name('file-manager.preview');
    Route::post('/file-manager/rename', [FileManagerController::class, 'rename'])->name('file-manager.rename');
    Route::get('/file-manager/permissions', [FileManagerController::class, 'permissions'])->name('file-manager.permissions');
    Route::post('/file-manager/permissions', [FileManagerController::class, 'updatePermissions'])->name('file-manager.permissions.update');

    // Database Management
    Route::get('/databases', [DatabaseManagementController::class, 'index'])->name('databases.index');
    Route::get('/databases/create', [DatabaseManagementController::class, 'create'])->name('databases.create');
    Route::post('/databases', [DatabaseManagementController::class, 'store'])->name('databases.store');
    Route::get('/databases/{database}/edit', [DatabaseManagementController::class, 'edit'])->name('databases.edit');
    Route::put('/databases/{database}', [DatabaseManagementController::class, 'update'])->name('databases.update');
    Route::delete('/databases/{database}', [DatabaseManagementController::class, 'destroy'])->name('databases.destroy');
    Route::get('/databases/{database}/phpmyadmin', [DatabaseManagementController::class, 'phpMyAdmin'])->name('databases.phpmyadmin');

    // Monitoring
    Route::get('/monitoring', [MonitoringController::class, 'index'])->name('monitoring.index');

    // Backups
    Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');
    Route::post('/backups', [BackupController::class, 'store'])->name('backups.store');
    Route::get('/backups/{backup}/download', [BackupController::class, 'download'])->name('backups.download');
    Route::delete('/backups/{backup}', [BackupController::class, 'destroy'])->name('backups.destroy');

    // Cron Jobs
    Route::get('/cron-jobs', [CronJobController::class, 'index'])->name('cron-jobs.index');
    Route::get('/cron-jobs/create', [CronJobController::class, 'create'])->name('cron-jobs.create');
    Route::post('/cron-jobs', [CronJobController::class, 'store'])->name('cron-jobs.store');
    Route::get('/cron-jobs/{id}/edit', [CronJobController::class, 'edit'])->name('cron-jobs.edit');
    Route::put('/cron-jobs/{id}', [CronJobController::class, 'update'])->name('cron-jobs.update');
    Route::delete('/cron-jobs/{id}', [CronJobController::class, 'destroy'])->name('cron-jobs.destroy');
    Route::post('/cron-jobs/{id}/toggle', [CronJobController::class, 'toggleStatus'])->name('cron-jobs.toggle');
    Route::post('/cron-jobs/{id}/run', [CronJobController::class, 'runNow'])->name('cron-jobs.run');

    // Firewall Management
    Route::get('/firewall', [FirewallController::class, 'index'])->name('firewall.index');
    Route::post('/firewall', [FirewallController::class, 'store'])->name('firewall.store');
    Route::delete('/firewall/{id}', [FirewallController::class, 'destroy'])->name('firewall.destroy');
    Route::post('/firewall/apply', [FirewallController::class, 'apply'])->name('firewall.apply');

});

// User Management (Admin only)
Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('users', UserController::class);
    Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
});



require __DIR__.'/auth.php';
