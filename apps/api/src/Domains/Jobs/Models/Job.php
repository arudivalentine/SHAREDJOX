<?php

namespace App\Domains\Jobs\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Job extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'client_id',
        'title',
        'description',
        'type',
        'budget_min',
        'budget_max',
        'status',
        'required_skills',
        'estimated_duration',
        'claimed_by',
        'claimed_at',
        'deliverables_required',
        'deliverables',
        'delivered_at',
        'completed_at',
        'escrow_transaction_id',
    ];

    protected $casts = [
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'required_skills' => 'json',
        'deliverables_required' => 'json',
        'deliverables' => 'json',
        'claimed_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'client_id');
    }

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'claimed_by');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isClaimed(): bool
    {
        return $this->status === 'claimed';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function canBeClaimed(): bool
    {
        return $this->status === 'active' && !$this->claimed_by;
    }

    public function isPendingReview(): bool
    {
        return $this->status === 'pending_review';
    }

    public function isWithinDeadline(): bool
    {
        if (!$this->claimed_at) {
            return true;
        }

        $deadline = match ($this->type) {
            'flash' => 2,
            'sprint' => 24,
            'anchor' => 72,
            default => 2,
        };

        return $this->claimed_at->addHours($deadline)->isFuture();
    }
}
