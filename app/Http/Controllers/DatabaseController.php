<?php

namespace App\Http\Controllers;

use App\Models\Database;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;

class DatabaseController extends Controller
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
            // Validate character set and collation against whitelist
            $allowedCharsets = ['utf8mb4', 'utf8', 'latin1', 'ascii'];
            $allowedCollations = [
                'utf8mb4_unicode_ci', 'utf8mb4_general_ci', 'utf8mb4_bin',
                'utf8_unicode_ci', 'utf8_general_ci', 'utf8_bin',
                'latin1_swedish_ci', 'latin1_general_ci', 'latin1_bin',
                'ascii_general_ci', 'ascii_bin'
            ];
            
            if (!in_array($charSet, $allowedCharsets)) {
                throw new \Exception('Invalid character set');
            }
            if (!in_array($collation, $allowedCollations)) {
                throw new \Exception('Invalid collation');
            }
            
            // Create database using parameterized approach
            DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET ? COLLATE ?", [$charSet, $collation]);
            
            // Create user and grant privileges - use prepared statements
            DB::statement("CREATE USER IF NOT EXISTS ?@'localhost' IDENTIFIED BY ?", [$dbUser, $dbPassword]);
            DB::statement("GRANT ALL PRIVILEGES ON `{$dbName}`.* TO ?@'localhost'", [$dbUser]);
            DB::statement("FLUSH PRIVILEGES");

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
            $dbPassword = $validated['db_password'];
            
            // Update user password using prepared statement
            DB::statement("ALTER USER ?@'localhost' IDENTIFIED BY ?", [$database->db_user, $dbPassword]);
            DB::statement("FLUSH PRIVILEGES");

            // Update in HerPanel database
            $database->update([
                'db_password' => encrypt($dbPassword),
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
            // Drop user first using prepared statement
            DB::statement("DROP USER IF EXISTS ?@'localhost'", [$database->db_user]);
            
            // Drop database (db_name is already validated and prefixed)
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

        // For simplicity, redirect to phpMyAdmin with DB name as suggestion
        $phpMyAdminUrl = config('app.url') . '/phpmyadmin/';
        
        // We'll use a simpler approach: just redirect to phpMyAdmin
        // The user will need to log in with the database credentials
        // In production, you'd implement proper SSO with phpMyAdmin
        
        return inertia('Databases/PhpMyAdminRedirect', [
            'database' => $database,
            'phpmyadmin_url' => $phpMyAdminUrl,
        ]);
    }
}
