<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DomainSeeder extends Seeder
{
    public function run(): void
    {
        // Insert sample domains - use user_id 1 (admin)
        DB::table('domains')->insert([
            ['domain_name' => 'herpanel.test', 'user_id' => 1, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['domain_name' => 'example.com', 'user_id' => 1, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Insert sample subdomains - kolom: name, status
        DB::table('subdomains')->insert([
            ['domain_id' => 1, 'name' => 'www', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['domain_id' => 1, 'name' => 'api', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['domain_id' => 1, 'name' => 'admin', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['domain_id' => 2, 'name' => 'sub', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}