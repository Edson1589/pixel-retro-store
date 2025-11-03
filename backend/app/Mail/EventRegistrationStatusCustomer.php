<?php

namespace App\Mail;

use App\Models\EventRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventRegistrationStatusCustomer extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public EventRegistration $registration) {}

    public function build()
    {
        $ev = $this->registration->event()->first();
        $status = strtoupper($this->registration->status);
        $subject = "Actualización de registro ({$status}): " . ($ev->title ?? 'Evento');

        return $this
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject($subject)
            ->view('emails.events.customer_status_changed')
            ->with([
                'reg' => $this->registration,
                'ev'  => $ev,
            ]);
    }
}
