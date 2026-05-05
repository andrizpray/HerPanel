<?php

namespace App\Http\Controllers;

use App\Models\ManagedDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DatabaseManagementController extends Controller
{
    public function index()
    {
        $databases = ManagedDatabase::where('user_id', auth()->id())->latest()->get();
        return Inertia::render('Databases/Index', [
            'databases' => $databases
        ]);
    }

    public function create()
    {
        return Inertia::render('Databases/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'db_name' => 'required|string|regex:/^[a-zA-Z0-9_]+$/|max:64',
        ]);

        $dbName = 'user_' . auth()->id() . '_' . $validated['db_name'];
        
        // Check if database already exists in our records
        if (ManagedDatabase::where('db_name', $dbName)->exists()) {
            return back()->withErrors(['db_name' => 'Database name already exists.']);
        }

        try {
            // Create database in MySQL
            DB::statement("CREATE DATABASE IF NOT EXISTS `" . str_replace("`", "``", $dbName) . "`");
            
            // Record in our table
            ManagedDatabase::create([
                'user_id' => auth()->id(),
                'db_name' => $dbName,
                'status' => 'active',
            ]);

            return redirect()->route('databases.index')->with('success', 'Database created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['db_name' => 'Failed to create database: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $database = ManagedDatabase::where('user_id', auth()->id())->findOrFail($id);
        $dbName = $database->db_name;

        try {
            // Drop database in MySQL
            DB::statement("DROP DATABASE IF EXISTS `" . str_replace("`", "``", $dbName) . "`");
            
            // Remove from our records
            $database->delete();

            return redirect()->route('databases.index')->with('success', 'Database deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete database: ' . $e->getMessage()]);
        }
    }
}
