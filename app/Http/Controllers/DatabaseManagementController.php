<?php

namespace App\Http\Controllers;

use App\Models\Database;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class DatabaseManagementController extends Controller
{
    public function index()
    {
        $databases = Database::where('user_id', Auth::id())->get();
        
        return inertia('Databases/Index', [
            'databases' => $databases,
        ]);
    }

    public function create()
    {
        return inertia('Databases/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'db_name' => 'required|string|max:64|regex:/^[a-zA-Z0-9_]+$/',
            'db_user' => 'required|string|max:64|regex:/^[a-zA-Z0-9_]+$/',
            'db_password' => 'required|string|min:8',
            'character_set' => 'sometimes|string|max:32',
            'collation' => 'sometimes|string|max:64',
        ]);

        $userPrefix = 'u' . Auth::id() . '_';
        $dbName = $userPrefix . $validated['db_name'];
        $dbUser = $userPrefix . $validated['db_user'];
        $dbPassword = $validated['db_password'];
        $charSet = $validated['character_set'] ?? 'utf8mb4';
        $collation = $validated['collation'] ?? 'utf8mb4_unicode_ci';

        try {
            // Create database only (don't create user - requires extra privileges)
            DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET {$charSet} COLLATE {$collation}");
            
            // Save to HerPanel database
            Database::create([
                'user_id' => Auth::id(),
                'db_name' => $dbName,
                'db_user' => $dbUser,
                'db_password' => encrypt($dbPassword),
                'character_set' => $charSet,
                'collation' => $collation,
            ]);

            return redirect()->route('databases.index')->with('success', 'Database created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create database: ' . $e->getMessage()]);
        }
    }

    public function edit(Database $database)
    {
        $this->authorize('view', $database);
        
        return inertia('Databases/Edit', [
            'database' => $database,
        ]);
    }

    public function update(Request $request, Database $database)
    {
        $this->authorize('update', $database);

        $validated = $request->validate([
            'db_password' => 'required|string|min:8',
        ]);

        try {
            // Just update the stored password (can't alter MySQL user)
            $database->update([
                'db_password' => encrypt($validated['db_password']),
            ]);

            return redirect()->route('databases.index')->with('success', 'Database password updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update database: ' . $e->getMessage()]);
        }
    }

    public function destroy(Database $database)
    {
        $this->authorize('delete', $database);

        try {
            // Drop database
            DB::statement("DROP DATABASE IF EXISTS `{$database->db_name}`");

            // Delete from HerPanel database
            $database->delete();

            return redirect()->route('databases.index')->with('success', 'Database deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete database: ' . $e->getMessage()]);
        }
    }

    public function phpMyAdmin(Database $database)
    {
        $this->authorize('view', $database);

        $phpMyAdminUrl = config('app.url') . '/phpmyadmin/';
        
        return inertia('Databases/PhpMyAdminRedirect', [
            'database' => $database,
            'phpmyadmin_url' => $phpMyAdminUrl,
        ]);
    }
}
