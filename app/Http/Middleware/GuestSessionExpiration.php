<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GuestSessionExpiration
{
    /**
     * Handle an incoming request.
     * Check if guest session has expired (24 hours).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->get('is_guest')) {
            $guestCreatedAt = $request->session()->get('guest_created_at');
            
            // Guest session expires after 24 hours
            if ($guestCreatedAt && (time() - $guestCreatedAt) > 86400) {
                $request->session()->forget('is_guest');
                $request->session()->forget('guest_name');
                $request->session()->forget('guest_created_at');
                
                return redirect('/login')->with('message', 'Your guest session has expired. Please log in or continue as guest again.');
            }
            
            // Set creation time if not set
            if (!$guestCreatedAt) {
                $request->session()->put('guest_created_at', time());
            }
        }

        return $next($request);
    }
}

