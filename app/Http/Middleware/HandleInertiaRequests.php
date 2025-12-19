<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Check if user is authenticated
        if ($request->user()) {
            $user = [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ];
        } else {
            $user = null;
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'message' => $request->session()->get('message'),
                'error' => $request->session()->get('error'),
            ],
            'dictionaryResult' => $request->session()->get('dictionaryResult'),
        ]);
    }
}

