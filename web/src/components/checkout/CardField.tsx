import { useMemo } from 'react';

type CardBrand = 'visa' | 'mastercard' | 'card';

export type CardValue = {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
};

type Props = {
    value: CardValue;
    onChange: (v: CardValue) => void;
};

const digits = (s: string): string => s.replace(/\D+/g, '');
const luhn = (num: string): boolean => {
    let sum = 0, dbl = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let d = Number(num[i]);
        if (dbl) { d *= 2; if (d > 9) d -= 9; }
        sum += d; dbl = !dbl;
    }
    return sum % 10 === 0;
};
const brand = (num: string): CardBrand =>
    /^4/.test(num) ? 'visa' : /^5[1-5]/.test(num) ? 'mastercard' : 'card';

export default function CardField({ value, onChange }: Props) {
    const raw = useMemo(() => digits(value.number), [value.number]);
    const fmt = useMemo(() => raw.replace(/(\d{4})(?=\d)/g, '$1 '), [raw]);
    const valid = raw.length >= 13 && raw.length <= 19 && luhn(raw);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {/* Número de tarjeta */}
            <div className="relative">
                <input
                    className="border rounded-xl px-3 py-2 w-full"
                    value={fmt}
                    onChange={(e) => onChange({ ...value, number: e.target.value })}
                    placeholder="Número de tarjeta"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={23}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded bg-gray-100">
                    {brand(raw)}
                </div>
                {value.number && !valid && (
                    <div className="text-xs text-red-600 mt-1">Número inválido</div>
                )}
            </div>

            {/* CVC */}
            <input
                className="border rounded-xl px-3 py-2 w-full"
                placeholder="CVC"
                value={value.cvc}
                onChange={(e) => onChange({ ...value, cvc: digits(e.target.value).slice(0, 4) })}
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
            />

            {/* Mes de expiración */}
            <input
                className="border rounded-xl px-3 py-2 w-full"
                placeholder="Mes (MM)"
                value={value.exp_month}
                onChange={(e) => onChange({ ...value, exp_month: digits(e.target.value).slice(0, 2) })}
                inputMode="numeric"
                autoComplete="cc-exp-month"
                maxLength={2}
            />

            {/* Año de expiración */}
            <input
                className="border rounded-xl px-3 py-2 w-full"
                placeholder="Año (YYYY)"
                value={value.exp_year}
                onChange={(e) => onChange({ ...value, exp_year: digits(e.target.value).slice(0, 4) })}
                inputMode="numeric"
                autoComplete="cc-exp-year"
                maxLength={4}
            />
        </div>
    );
}
