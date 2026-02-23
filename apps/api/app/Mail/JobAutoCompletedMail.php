<?php

namespace App\Mail;

use App\Domains\Jobs\Models\Job;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class JobAutoCompletedMail extends Mailable
{
    public function __construct(
        public Job $job,
        public float $amount,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Job auto-completed: '{$this->job->title}'",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.job-auto-completed',
            with: [
                'job' => $this->job,
                'amount' => $this->amount,
            ],
        );
    }
}
