<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
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

    public function preview(Request $request)
    {
        $request->validate([
            'item_path' => 'required|string',
        ]);

        $itemPath = $this->basePath . '/' . $request->item_path;

        if (!Storage::exists($itemPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        $mimeType = Storage::mimeType($itemPath);
        $extension = strtolower(pathinfo($request->item_path, PATHINFO_EXTENSION));

        // Text files
        $textExtensions = ['txt', 'log', 'conf', 'ini', 'env', 'json', 'xml', 'html', 'css', 'js', 'php', 'md'];
        
        if (in_array($extension, $textExtensions) || str_starts_with($mimeType, 'text/')) {
            $content = Storage::get($itemPath);
            return response()->json([
                'type' => 'text',
                'content' => $content,
                'mime' => $mimeType,
            ]);
        }

        // Images
        if (str_starts_with($mimeType, 'image/')) {
            return response()->json([
                'type' => 'image',
                'url' => Storage::url($itemPath),
                'mime' => $mimeType,
            ]);
        }

        // PDF
        if ($mimeType === 'application/pdf' || $extension === 'pdf') {
            return response()->json([
                'type' => 'pdf',
                'url' => Storage::url($itemPath),
            ]);
        }

        return response()->json(['error' => 'Preview not supported for this file type'], 400);
    }

    public function rename(Request $request)
    {
        $request->validate([
            'item_path' => 'required|string',
            'new_name' => 'required|string|regex:/^[a-zA-Z0-9._-]+$/',
        ]);

        $oldPath = $this->basePath . '/' . $request->item_path;
        $parentPath = dirname($request->item_path);
        $newPath = $this->basePath . '/' . ($parentPath === '.' ? '' : $parentPath . '/') . $request->new_name;

        if (!Storage::exists($oldPath)) {
            return back()->withErrors(['item_path' => 'Item not found.']);
        }

        if (Storage::exists($newPath)) {
            return back()->withErrors(['new_name' => 'An item with this name already exists.']);
        }

        Storage::move($oldPath, $newPath);

        $displayPath = $parentPath === '.' ? '' : $parentPath;
        return redirect()->route('file-manager.index', ['path' => $displayPath])->with('success', 'Item renamed successfully.');
    }

    public function permissions(Request $request)
    {
        $request->validate([
            'item_path' => 'required|string',
        ]);

        $itemPath = $this->basePath . '/' . $request->item_path;

        if (!Storage::exists($itemPath)) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        // Get full filesystem path
        $fullPath = storage_path('app/' . $itemPath);
        $perms = fileperms($fullPath);

        return response()->json([
            'path' => $request->item_path,
            'permissions' => substr(sprintf('%o', $perms), -4),
            'octal' => decoct($perms & 0777),
            'owner_read' => ($perms & 0x0100) ? true : false,
            'owner_write' => ($perms & 0x0080) ? true : false,
            'owner_execute' => ($perms & 0x0040) ? true : false,
            'group_read' => ($perms & 0x0020) ? true : false,
            'group_write' => ($perms & 0x0010) ? true : false,
            'group_execute' => ($perms & 0x0008) ? true : false,
            'public_read' => ($perms & 0x0004) ? true : false,
            'public_write' => ($perms & 0x0002) ? true : false,
            'public_execute' => ($perms & 0x0001) ? true : false,
        ]);
    }

    public function updatePermissions(Request $request)
    {
        $request->validate([
            'item_path' => 'required|string',
            'permissions' => 'required|string|regex:/^[0-7]{3,4}$/',
        ]);

        $itemPath = $this->basePath . '/' . $request->item_path;
        $fullPath = storage_path('app/' . $itemPath);

        if (!Storage::exists($itemPath)) {
            return back()->withErrors(['item_path' => 'Item not found.']);
        }

        chmod($fullPath, octdec($request->permissions));

        return back()->with('success', 'Permissions updated successfully.');
    }
}
