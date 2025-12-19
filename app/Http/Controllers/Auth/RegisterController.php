<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function showRegistrationForm()
    {
        return Inertia::render('SignupPage');
    }

    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => null, // Email verification can be added later
            ]);

            Log::info('New user registered', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            // Send email verification (optional - uncomment when email is configured)
            // $user->notify(new VerifyEmail());

            Auth::login($user);

            return redirect('/translator')->with('message', 'Account created successfully! Welcome to Lyrin! 🎉');
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'email' => 'An error occurred during registration. Please try again.',
            ])->onlyInput('email', 'name');
        }
    }
}

