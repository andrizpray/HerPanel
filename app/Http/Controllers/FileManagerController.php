<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FileManagerController extends Controller
{
    protected $basePath = 'filemanager';

    public function index(Request $request)
    {
        $path = $request->get('path', '');
        $fullPath = $this->basePath . ($path ? '/' . $path : '');

        // Ensure directory exists
        if (!Storage::exists($fullPath)) {
            Storage::makeDirectory($fullPath);
        }

        $items = [];
        $directories = Storage::directories($fullPath);
        $files = Storage::files($fullPath);

        foreach ($directories as $dir) {
            $items[] = [
                'name' => basename($dir),
                'type' => 'dir',
                'path' => str_replace($this->basePath . '/', '', $dir),
            ];
        }

        foreach ($files as $file) {
            $items[] = [
                'name' => basename($file),
                'type' => 'file',
                'path' => str_replace($this->basePath . '/', '', $file),
                'size' => Storage::size($file),
                'url' => Storage::url($file),
            ];
        }

        return Inertia::render('FileManager/Index', [
            'items' => $items,
            'currentPath' => $path,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'path' => 'nullable|string',
        ]);

        $path = $request->get('path', '');
        $fullPath = $this->basePath . ($path ? '/' . $path : '');

        $request->file('file')->storeAs($fullPath, $request->file('file')->getClientOriginalName());

        return redirect()->route('file-manager.index', ['path' => $path])->with('success', 'File uploaded successfully.');
    }

    public function mkdir(Request $request)
    {
        $request->validate([
            'folder_name' => 'required|string|regex:/^[a-zA-Z0-9_-]+$/',
            'path' => 'nullable|string',
        ]);

        $path = $request->get('path', '');
        $fullPath = $this->basePath . ($path ? '/' . $path : '') . '/' . $request->folder_name;

        if (Storage::exists($fullPath)) {
            return back()->withErrors(['folder_name' => 'Folder already exists.']);
        }

        Storage::makeDirectory($fullPath);

        return redirect()->route('file-manager.index', ['path' => $path])->with('success', 'Folder created successfully.');
    }

    public function delete(Request $request)
    {
        $request->validate([
            'item_path' => 'required|string',
        ]);

        $itemPath = $this->basePath . '/' . $request->item_path;

        if (!Storage::exists($itemPath)) {
            return back()->withErrors(['item_path' => 'Item not found.']);
        }

        Storage::deleteDirectory($itemPath);
        Storage::delete($itemPath);

        $parentPath = dirname($request->item_path);
        if ($parentPath === '.') $parentPath = '';

        return redirect()->route('file-manager.index', ['path' => $parentPath])->with('success', 'Item deleted successfully.');
    }
}
