// src/components/CartErrorToast.tsx
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { errorMessages } from "../utils/errorMessages";

export default function CartErrorToast() {
  const { cartError } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (cartError) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000); // se esconde en 3s
      return () => clearTimeout(timer);
    }
  }, [cartError]);

  if (!cartError || !visible) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
      <AlertTriangle className="w-5 h-5" />
      <span>{errorMessages[cartError] || errorMessages.default}</span>
    </div>
  );
}
