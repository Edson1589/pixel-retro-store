<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    use HasFactory, Notifiable;
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'must_change_password',
        'temp_password_expires_at',
        'created_by_admin_id',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
    public function isSeller(): bool
    {
        return $this->role === 'seller';
    }
    public function isTechnician(): bool
    {
        return $this->role === 'technician';
    }
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
            'temp_password_expires_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    public function cart()
    {
        return $this->hasOne(\App\Models\Cart::class);
    }
    public function sales()
    {
        return $this->hasMany(\App\Models\Sale::class);
    }
}
