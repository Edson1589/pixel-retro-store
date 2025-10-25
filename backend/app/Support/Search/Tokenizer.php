<?php

namespace App\Support\Search;

class Tokenizer
{
    public static function terms(string $text): array
    {
        $text = mb_strtolower(self::ascii($text));
        $text = preg_replace('/[^a-z0-9áéíóúñü]+/u', ' ', $text) ?? '';
        $raw = preg_split('/\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $stop = collect(config('search.stop_words', []))
            ->map(fn($w) => mb_strtolower(self::ascii($w)))
            ->flip();

        $tokens = [];
        foreach ($raw as $w) {
            if (mb_strlen($w) < 1) continue;
            if ($stop->has($w)) continue;
            $tokens[] = $w;
        }

        return array_values(array_unique($tokens));
    }

    public static function ascii(string $s): string
    {
        $r = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
        if ($r !== false) return $r;
        $from = 'áàäâãéèëêíìïîóòöôõúùüûñ';
        $to   = 'aaaaaeeeeiiiiooooouuuun';
        return strtr($s, array_combine(preg_split('//u', $from, -1, PREG_SPLIT_NO_EMPTY), str_split($to)));
    }

    public static function phrase(array $terms): string
    {
        return implode(' ', $terms);
    }
}
