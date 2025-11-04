<?php

namespace App\Mail\Admin;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewUserTemporaryCredentials extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $tempPassword) {}

    public function build()
    {
        $front = rtrim(config('app.frontend_url', env('FRONTEND_URL', env('APP_URL'))), '/');
        $loginUrl = $front . '/admin/login';

        return $this->subject('Tu acceso a Pixel Retro Store')
            ->view('emails.admin.new_user_temp_credentials')
            ->with([
                'user' => $this->user,
                'tempPassword' => $this->tempPassword,
                'loginUrl' => $loginUrl,
            ]);
    }
}
