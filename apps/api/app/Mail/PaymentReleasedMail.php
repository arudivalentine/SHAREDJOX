<?php

namespace App\Mail;

use App\Domains\Jobs\Models\Job;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class PaymentReleasedMail extends Mailable
{
    public function __construct(
        public Job $job,
        public float $amount,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Payment released for '{$this->job->title}'",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-released',
            with: [
                'job' => $this->job,
                'amount' => $this->amount,
            ],
        );
    }
}
