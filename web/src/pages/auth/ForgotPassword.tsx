import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/password/forgot", { email });
      setMsg("✅ Se envió una contraseña temporal a tu correo.");
    } catch (err: any) {
      setMsg(err.response?.data?.error ?? "❌ Error enviando correo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#07101B] text-white">
      <form onSubmit={submit} className="w-[400px] max-w-full p-6 rounded-2xl bg-white/[0.04] border border-white/10">
        <h2 className="text-xl font-bold mb-2 text-center">Recuperar contraseña</h2>
        <p className="text-sm text-white/60 mb-4 text-center">
          Ingresa tu correo y te enviaremos una contraseña temporal para acceder.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="w-full mb-3 rounded-lg px-3 py-2 bg-white/[0.06] border border-white/10 text-white/90"
        />
        <button disabled={busy} className="w-full py-2 rounded-lg bg-[linear-gradient(90deg,#7C3AED_0%,#06B6D4_100%)]">
          {busy ? "Enviando..." : "Enviar"}
        </button>
        {msg && <p className="mt-3 text-sm text-center">{msg}</p>}
      </form>
    </div>
  );
}
