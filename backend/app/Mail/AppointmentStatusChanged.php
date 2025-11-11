<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment, public string $title, public string $bodyLine) {}

    public function build()
    {
        return $this->subject($this->title)
            ->text('emails.appointment_status_plain');
    }
}
