import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { clearCustomerToken, getCustomerToken } from "../../services/customerApi";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    try {
      const token = getCustomerToken(); // ✅ usa helper centralizado
      if (!token) {
        setMsg("❌ Sesión inválida. Vuelve a iniciar sesión.");
        return;
      }

      const res = await axios.post(
        "http://127.0.0.1:8000/api/password/change",
        { password, password_confirmation: confirm },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("✅ Contraseña actualizada correctamente. Redirigiendo...");
      setPassword("");
      setConfirm("");

      // ✅ Limpia token anterior y fuerza nuevo login
      clearCustomerToken();

      // ⏳ Redirige al login después de 2 segundos
      setTimeout(() => {
        nav("/login", { replace: true });
      }, 2000);

    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "❌ Error al actualizar contraseña.";
      setMsg(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#07101B] text-white">
      <form
        onSubmit={submit}
        className="w-[400px] max-w-full p-6 rounded-2xl bg-white/[0.04] border border-white/10"
      >
        <h2 className="text-xl font-bold mb-2 text-center">
          Cambiar contraseña
        </h2>
        <p className="text-sm text-white/60 mb-4 text-center">
          Define una nueva contraseña segura para tu cuenta.
        </p>

        <input
          type="password"
          required
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 rounded-lg px-3 py-2 bg-white/[0.06] border border-white/10 text-white/90"
        />

        <input
          type="password"
          required
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full mb-3 rounded-lg px-3 py-2 bg-white/[0.06] border border-white/10 text-white/90"
        />

        <button
          disabled={busy}
          className="w-full py-2 rounded-lg bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]
                     hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Guardando..." : "Actualizar contraseña"}
        </button>

        {msg && (
          <p className="mt-3 text-sm text-center">
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
