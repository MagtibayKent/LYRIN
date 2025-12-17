<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Translation Services Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the translation API providers. MyMemory is the primary
    | provider, and LibreTranslate serves as the fallback when MyMemory
    | is unavailable or returns errors.
    |
    */

    'libretranslate' => [
        'url' => env('LIBRETRANSLATE_URL', 'http://localhost:5000'),
        'api_key' => env('LIBRETRANSLATE_API_KEY', null),
    ],

    'translation' => [
        'timeout' => env('TRANSLATION_TIMEOUT', 10),
        'cache_ttl' => env('TRANSLATION_CACHE_TTL', 3600),
        'cache_enabled' => env('TRANSLATION_CACHE_ENABLED', true),
    ],

];
