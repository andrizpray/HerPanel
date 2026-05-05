<?php

use App\Http\Controllers\DatabaseManagementController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\FileManagerController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\ProfileController;
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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Domains
    Route::get('/domains', [DomainController::class, 'index'])->name('domains.index');
    Route::get('/domains/create', [DomainController::class, 'create'])->name('domains.create');
    Route::post('/domains', [DomainController::class, 'store'])->name('domains.store');
    Route::delete('/domains/{id}', [DomainController::class, 'destroy'])->name('domains.destroy');

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
    Route::delete('/databases/{id}', [DatabaseManagementController::class, 'destroy'])->name('databases.destroy');

    // Monitoring
    Route::get('/monitoring', [MonitoringController::class, 'index'])->name('monitoring.index');
});

require __DIR__.'/auth.php';
