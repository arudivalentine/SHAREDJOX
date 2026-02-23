<?php

namespace App\Mail;

use App\Domains\Jobs\Models\Job;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class RevisionRequestedMail extends Mailable
{
    public function __construct(
        public Job $job,
        public string $feedback,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Revisions requested for '{$this->job->title}'",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.revision-requested',
            with: [
                'job' => $this->job,
                'feedback' => $this->feedback,
            ],
        );
    }
}
