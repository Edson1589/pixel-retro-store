<?php

namespace App\Mail;

use App\Models\Sale;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SaleReceiptCustomer extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Sale $sale) {}

    public function build()
    {
        return $this
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Tu compra #' . $this->sale->id . ' en Pixel Retro Store')
            ->view('emails.sales.customer_receipt')
            ->with([
                'sale' => $this->sale,
            ]);
    }
}
