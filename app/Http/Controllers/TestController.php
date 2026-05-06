<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;

class TestController extends Controller
{
    public function testRedirect()
    {
        return Redirect::route('databases.index')->with('success', 'Test redirect berhasil!');
    }
}
