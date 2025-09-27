// src/utils/errorMessages.ts
export const errorMessages: Record<string, string> = {
  // Errores de tarjeta
  card_declined: 'Tu tarjeta fue rechazada. Por favor intenta con otra.',
  expired_card: 'Tu tarjeta ha expirado. Actualiza los datos o usa otra tarjeta.',
  insufficient_funds: 'No tienes fondos suficientes para completar el pago.',
  invalid_number: 'El número de tarjeta no es válido.',
  invalid_cvc: 'El código de seguridad (CVC) no es válido.',
  invalid_expiry: 'La fecha de expiración es inválida.',
  incorrect_otp: 'El código OTP es incorrecto. Intenta nuevamente.',

  // Errores de flujo de checkout
  stock_unavailable: 'No hay suficiente stock para completar la compra.',
  unauthorized: 'Debes iniciar sesión para continuar.',
  invalid_form: 'Completa todos los datos obligatorios antes de continuar.',
  empty_cart: 'Tu carrito está vacío.',
  missing_fields: 'Completa los datos obligatorios.',
  payment_failed: 'El pago no pudo completarse.',
  otp_failed: 'El código OTP no es válido.',
  unknown_error: 'Ocurrió un error inesperado.',
  network_error: 'Error de conexión. Verifica tu internet e inténtalo nuevamente.',

  // Fallback
  default: 'Ocurrió un error inesperado. Intenta nuevamente más tarde.',
};
