<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class WebmailController extends Controller
{
    public function __invoke(Request $request)
    {
        // Redirect to Roundcube webmail
        return redirect('/webmail/');
    }
}
