<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Campos que se pueden asignar masivamente
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'force_password_change', // ✅ importante para guardar el flag
    ];

    /**
     * Campos que se ocultan en serialización
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Tipos de datos de ciertos atributos
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'force_password_change' => 'boolean', // ✅ clave para que funcione el if()
    ];

    /**
     * Métodos helper de rol
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Relaciones
     */
    public function cart()
    {
        return $this->hasOne(\App\Models\Cart::class);
    }

    public function sales()
    {
        return $this->hasMany(\App\Models\Sale::class);
    }
}
