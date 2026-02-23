<?php

namespace App\Domains\Jobs\Actions;

use App\Domains\Jobs\Models\Job;
use App\Domains\Jobs\DTOs\JobDTO;
use App\Models\User;
use App\Events\JobUpdatedEvent;
use App\Mail\DeliverableSubmittedMail;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;

class SubmitDeliverableAction
{
    public function execute(
        User $freelancer,
        Job $job,
        array $files,
        ?string $notes = null,
    ): JobDTO {
        if ($job->claimed_by !== $freelancer->id) {
            throw new \DomainException('Only the freelancer who claimed this job can submit deliverables');
        }

        if ($job->status !== 'claimed') {
            throw new \DomainException('Job must be in claimed status to submit deliverables');
        }

        if (!$job->isWithinDeadline()) {
            throw new \DomainException('Deliverable submission deadline has passed');
        }

        if (empty($files)) {
            throw new \DomainException('At least one file is required');
        }

        if (count($files) > 5) {
            throw new \DomainException('Maximum 5 files allowed');
        }

        if ($notes && strlen($notes) > 1000) {
            throw new \DomainException('Notes must be 1000 characters or less');
        }

        $deliverables = [];
        $allowedMimes = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip'];
        $maxFileSize = 10 * 1024 * 1024;

        foreach ($files as $file) {
            if (!$file instanceof UploadedFile) {
                throw new \DomainException('Invalid file upload');
            }

            if ($file->getSize() > $maxFileSize) {
                throw new \DomainException("File {$file->getClientOriginalName()} exceeds 10MB limit");
            }

            if (!in_array($file->getMimeType(), $allowedMimes)) {
                throw new \DomainException("File type {$file->getMimeType()} not allowed");
            }

            $path = $file->store("jobs/{$job->id}/deliverables", 'local');

            $deliverables[] = [
                'filename' => $file->getClientOriginalName(),
                'path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'uploaded_at' => now()->toIso8601String(),
            ];
        }

        $job->update([
            'status' => 'pending_review',
            'deliverables' => $deliverables,
            'delivered_at' => now(),
        ]);

        $freelancer->recordEvent('deliverable_submitted', [
            'job_id' => $job->id,
            'file_count' => count($files),
            'notes' => $notes,
        ]);

        $job->client->recordEvent('deliverable_received', [
            'job_id' => $job->id,
            'from_user_id' => $freelancer->id,
            'file_count' => count($files),
        ]);

        JobUpdatedEvent::dispatch($job);

        Mail::send(new DeliverableSubmittedMail($job, $freelancer->name));

        return JobDTO::fromModel($job);
    }
}
