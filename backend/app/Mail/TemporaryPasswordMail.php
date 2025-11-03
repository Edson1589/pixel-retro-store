<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TemporaryPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tempPassword;

    /**
     * Create a new message instance.
     */
    public function __construct($tempPassword)
    {
        $this->tempPassword = $tempPassword;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Recuperación de contraseña - Pixel Retro Store')
            ->view('emails.password.temporary')
            ->with([
                'tempPassword' => $this->tempPassword,
            ]);
    }
}
