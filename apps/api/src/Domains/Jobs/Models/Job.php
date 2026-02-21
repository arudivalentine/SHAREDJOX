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
    ];

    protected $casts = [
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'required_skills' => 'json',
        'deliverables_required' => 'json',
        'claimed_at' => 'datetime',
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
}
