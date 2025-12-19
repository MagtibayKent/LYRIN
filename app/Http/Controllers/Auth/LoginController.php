<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('LoginPage');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        try {
            if (Auth::attempt($credentials, $request->boolean('remember'))) {
                $request->session()->regenerate();
                
                Log::info('User logged in', [
                    'user_id' => Auth::id(),
                    'email' => $credentials['email'],
                ]);
                
                return redirect()->intended('/translator');
            }

            Log::warning('Failed login attempt', [
                'email' => $credentials['email'],
            ]);

            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'email' => 'An error occurred during login. Please try again.',
            ])->onlyInput('email');
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}

