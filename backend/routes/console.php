<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment('Welcome to Lyrin Translator API!');
})->purpose('Display an inspiring quote');
