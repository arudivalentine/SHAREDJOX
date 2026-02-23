<?php

namespace App\Mail;

use App\Domains\Jobs\Models\Job;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class JobClaimedMail extends Mailable
{
    public function __construct(
        public Job $job,
        public string $freelancerName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your job '{$this->job->title}' has been claimed",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.job-claimed',
            with: [
                'job' => $this->job,
                'freelancerName' => $this->freelancerName,
            ],
        );
    }
}
