<?php

namespace App\Mail;

use App\Models\Sale;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SaleReceiptAdmin extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Sale $sale) {}

    public function build()
    {
        return $this
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Nueva venta #' . $this->sale->id . ' (Pixel Retro Store)')
            ->view('emails.sales.admin_receipt')
            ->with([
                'sale' => $this->sale,
            ]);
    }
}
