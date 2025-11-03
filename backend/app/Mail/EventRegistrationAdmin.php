<?php

namespace App\Mail;

use App\Models\EventRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventRegistrationAdmin extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public EventRegistration $registration) {}

    public function build()
    {
        $ev = $this->registration->event()->first();

        return $this
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Nuevo registro: ' . ($ev->title ?? 'Evento'))
            ->view('emails.events.admin_new_registration')
            ->with([
                'reg' => $this->registration,
                'ev'  => $ev,
            ]);
    }
}
