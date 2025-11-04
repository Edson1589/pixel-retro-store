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
        $this->registration->loadMissing('event');
        $ev = $this->registration->event;

        $front = rtrim(config('app.frontend_url', env('FRONTEND_URL', env('APP_URL'))), '/');

        $loginUrl = $front . '/admin/login';
        $eventUrl = $ev?->slug
            ? $front . '/events/' . $ev->slug
            : $front . '/events';

        $status  = strtoupper($this->registration->status);
        $subject = "Actualización de registro ({$status}): " . ($ev->title ?? 'Evento');

        return $this
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject($subject)
            ->view('emails.events.customer_status_changed')
            ->with([
                'reg'       => $this->registration,
                'ev'        => $ev,
                'loginUrl'  => $loginUrl,
                'eventUrl'  => $eventUrl,
            ]);
    }
}
