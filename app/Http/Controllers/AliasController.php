<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\EmailAlias;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AliasController extends Controller
{
    public function index()
    {
        $aliases = EmailAlias::with('domain')
            ->whereHas('domain', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->get();

        $domains = Domain::where('user_id', Auth::id())->get();

        return inertia('Emails/Aliases/Index', [
            'aliases' => $aliases,
            'domains' => $domains,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'domain_id' => 'required|exists:domains,id',
            'source' => 'required|string|max:255',
            'destination' => 'required|email|max:255',
        ]);

        // Verify domain belongs to user
        $domain = Domain::where('id', $request->domain_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $fullSource = $request->source . '@' . $domain->domain_name;

        // Check uniqueness
        $exists = EmailAlias::where('source', $fullSource)->exists();
        if ($exists) {
            return back()->withErrors(['source' => 'This alias already exists.']);
        }

        EmailAlias::create([
            'domain_id' => $request->domain_id,
            'source' => $fullSource,
            'destination' => $request->destination,
        ]);

        return redirect()->route('aliases.index')->with('success', 'Alias created successfully.');
    }

    public function destroy($id)
    {
        $alias = EmailAlias::with('domain')
            ->whereHas('domain', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->findOrFail($id);

        $alias->delete();

        return redirect()->route('aliases.index')->with('success', 'Alias deleted successfully.');
    }
}
