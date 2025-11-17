import { useMemo } from 'react';
import { CreditCard, Lock, Calendar, Hash } from 'lucide-react';

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
const getBrand = (num: string): CardBrand =>
    /^4/.test(num) ? 'visa' : /^5[1-5]/.test(num) ? 'mastercard' : 'card';

export default function CardField({ value, onChange }: Props) {
    const raw = useMemo(() => digits(value.number), [value.number]);
    const fmt = useMemo(() => raw.replace(/(\d{4})(?=\d)/g, '$1 '), [raw]);
    const valid = raw.length >= 13 && raw.length <= 19 && luhn(raw);
    const brand = getBrand(raw);
    const brandLabel =
        brand === 'visa' ? 'VISA' :
            brand === 'mastercard' ? 'Mastercard' :
                'Tarjeta';

    const baseInput =
        'w-full rounded-xl pl-9 pr-3 py-2 bg-white/[0.05] text-white/90 ' +
        'placeholder:text-white/45 border border-white/10 ' +
        'focus:outline-none focus:ring-2 focus:ring-[#7C3AED66]';

    return (
        <div className="grid gap-2 md:gap-3 md:grid-cols-2">
            {/* Número de tarjeta */}
            <div className="md:col-span-2 space-y-1">
                <div className="relative">
                    <CreditCard className="h-4 w-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        className={`${baseInput} pr-24`}
                        value={fmt}
                        onChange={(e) =>
                            onChange({ ...value, number: e.target.value })
                        }
                        placeholder="Número de tarjeta"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        maxLength={23}
                    />

                    {raw && (
                        <div
                            className="absolute right-3 top-1/2 -translate-y-1/2
                   flex items-center gap-1 text-[11px]
                   px-2 py-0.5 rounded-full
                   bg-white/10 text-white/80 uppercase"
                        >
                            <span className="inline-block w-2 h-2 rounded-full
                         bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]" />
                            <span>{brandLabel}</span>
                        </div>
                    )}
                </div>

                {/* Mensaje de error con espacio reservado */}
                <p
                    className={`
      text-xs text-amber-300/90
      transition-all duration-150
      ${value.number && !valid
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 -translate-y-1 pointer-events-none'}
    `}
                >
                    Número de tarjeta inválido.
                </p>
            </div>

            {/* CVC */}
            <div className="relative">
                <Lock className="h-4 w-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    className={baseInput}
                    placeholder="CVC"
                    value={value.cvc}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            cvc: digits(e.target.value).slice(0, 4),
                        })
                    }
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                />
            </div>

            {/* Mes */}
            <div className="relative">
                <Calendar className="h-4 w-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    className={baseInput}
                    placeholder="Mes (MM)"
                    value={value.exp_month}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            exp_month: digits(e.target.value).slice(0, 2),
                        })
                    }
                    inputMode="numeric"
                    autoComplete="cc-exp-month"
                    maxLength={2}
                />
            </div>

            {/* Año */}
            <div className="relative">
                <Hash className="h-4 w-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    className={baseInput}
                    placeholder="Año (YYYY)"
                    value={value.exp_year}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            exp_year: digits(e.target.value).slice(0, 4),
                        })
                    }
                    inputMode="numeric"
                    autoComplete="cc-exp-year"
                    maxLength={4}
                />
            </div>
        </div>
    );
}
