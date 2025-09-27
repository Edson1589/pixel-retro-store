import { AlertTriangle } from "lucide-react";
import { errorMessages } from "../utils/errorMessages";

type Props = {
  code: string;
  message?: string; // mensaje opcional desde backend
};

export default function ErrorCard({ code, message }: Props) {
  const displayMessage = errorMessages[code] || errorMessages.default;

  return (
    <div
      className="max-w-md mx-auto mb-4 p-4 border border-red-300 bg-red-50 rounded-xl shadow-sm flex items-start gap-3"
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h2 className="font-semibold text-red-700 mb-0.5">Ocurrió un problema</h2>
        <p className="text-sm text-red-600">{displayMessage}</p>
        {message && (
          <p className="text-xs text-red-500 mt-1">{message}</p>
        )}
      </div>
    </div>
  );
}
