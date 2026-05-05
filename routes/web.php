<?php

use App\Http\Controllers\DomainController;
use App\Http\Controllers\FileManagerController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
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
});

require __DIR__.'/auth.php';
