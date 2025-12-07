<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class AdminTemporaryPassword extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $tempPassword,
        public Carbon $expiresAt,
        public string $loginUrl
    ) {}

    public function build()
    {
        return $this->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Tu contraseña temporal (acceso administrativo)')
            ->view('emails.admin.temporary_password')
            ->with([
                'user'      => $this->user,
                'temp'      => $this->tempPassword,
                'expiresAt' => $this->expiresAt,
                'loginUrl'  => $this->loginUrl,
            ]);
    }
}
