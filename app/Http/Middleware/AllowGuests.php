<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AllowGuests
{
    /**
     * Handle an incoming request.
     * Allow access if user is authenticated OR is a guest (has guest session).
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow if authenticated or has guest session
        if (auth()->check() || $request->session()->get('is_guest')) {
            return $next($request);
        }

        // Redirect to login if neither authenticated nor guest
        return redirect('/login');
    }
}

