<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LearningPreferenceController extends Controller
{
    public function get(Request $request)
    {
        try {
            $preference = $request->user()->learningPreference;

            if (!$preference) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'No preferences set yet',
                ], 200);
            }

            return response()->json([
                'success' => true,
                'data' => $preference,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get learning preference error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve preferences',
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'preferred_language' => ['required', 'string'],
                'target_languages' => ['nullable', 'array'],
                'daily_goal' => ['nullable', 'integer', 'min:1'],
                'notifications_enabled' => ['nullable', 'boolean'],
            ]);

            $preference = $request->user()->learningPreference()->updateOrCreate(
                ['user_id' => $request->user()->id],
                $validated
            );

            return response()->json([
                'success' => true,
                'message' => 'Learning preferences updated successfully',
                'data' => $preference,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Update learning preference error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update preferences',
            ], 500);
        }
    }

    public function delete(Request $request)
    {
        try {
            $preference = $request->user()->learningPreference;

            if ($preference) {
                $preference->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Learning preferences deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete learning preference error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete preferences',
            ], 500);
        }
    }
}
