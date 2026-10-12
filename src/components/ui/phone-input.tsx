import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  ALL_COUNTRIES,
  DEFAULT_COUNTRY,
  OTHER_COUNTRIES,
  PINNED_COUNTRIES,
  countryForDigits,
  flagEmoji,
  type Country,
} from "@/data/countries";

/**
 * Phone field with a country prefix picker. The form only ever sees the
 * E.164 string (`+40721234567`), or "" while the field is empty.
 *
 * Romanians type `07xx xxx xxx` out of habit; with +40 selected the trunk 0
 * is dropped from the emitted value as they type, and from the field on blur.
 * Typing or pasting `+961…` / `00961…` switches the picker to that country.
 */

const COPY = {
  ro: {
    search: "Caută țara sau prefixul",
    empty: "Nicio țară găsită.",
    popular: "Frecvente",
    all: "Toate țările",
    prefix: "Prefix",
  },
  en: {
    search: "Search country or code",
    empty: "No country found.",
    popular: "Common",
    all: "All countries",
    prefix: "Country code",
  },
} as const;

const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Digits to emit for the national part: RO drops its trunk 0. */
const nationalDigits = (country: Country, raw: string) => {
  const digits = raw.replace(/\D/g, "");
  return country.iso === "RO" && digits.startsWith("0")
    ? digits.slice(1)
    : digits;
};

const toE164 = (country: Country, raw: string) => {
  const digits = nationalDigits(country, raw);
  return digits ? `+${country.dial}${digits}` : "";
};

/** Split a stored value back into country + national part. */
function parse(
  value: string,
  fallback: Country,
): { country: Country; national: string } {
  const v = value.trim();
  if (!v) return { country: fallback, national: "" };
  if (v.startsWith("+") || v.startsWith("00")) {
    let digits = v.replace(/\D/g, "");
    if (!v.startsWith("+")) digits = digits.slice(2);
    const match = countryForDigits(digits);
    if (match)
      return { country: match, national: digits.slice(match.dial.length) };
    return { country: fallback, national: v };
  }
  // A bare local number (old drafts, prefill from earlier registrations) is Romanian.
  return {
    country: DEFAULT_COUNTRY,
    national: nationalDigits(DEFAULT_COUNTRY, v),
  };
}

export interface PhoneInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type" | "defaultValue"
> {
  value: string;
  onChange: (e164: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, onBlur, className, disabled, ...props }, ref) => {
    const { lang } = useI18n();
    const copy = COPY[lang === "en" ? "en" : "ro"];
    const initial = React.useMemo(() => parse(value, DEFAULT_COUNTRY), []); // eslint-disable-line react-hooks/exhaustive-deps
    const [country, setCountry] = React.useState<Country>(initial.country);
    const [national, setNational] = React.useState(initial.national);
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const lastEmitted = React.useRef<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const emit = (next: string) => {
      lastEmitted.current = next;
      if (next !== value) onChange(next);
    };

    // Adopt values set from outside (draft restore, prefill, form reset) and
    // normalise them, so a stored `0722…` reaches the form as `+40722…`.
    React.useEffect(() => {
      if (value === lastEmitted.current) return;
      const parsed = parse(value, country);
      setCountry(parsed.country);
      setNational(parsed.national);
      const normalised =
        value.trim() && !parsed.national.startsWith("+")
          ? toE164(parsed.country, parsed.national)
          : value;
      emit(normalised);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleInput = (raw: string) => {
      const trimmed = raw.trimStart();
      if (trimmed.startsWith("+") || trimmed.startsWith("00")) {
        let digits = trimmed.replace(/\D/g, "");
        if (!trimmed.startsWith("+")) digits = digits.slice(2);
        const match = countryForDigits(digits);
        if (match) {
          const rest = digits.slice(match.dial.length);
          setCountry(match);
          setNational(rest);
          emit(toE164(match, rest));
        } else {
          // Still typing the dial code: keep it visible until it resolves.
          setNational(trimmed);
          emit(digits ? `+${digits}` : "");
        }
        return;
      }
      setNational(raw);
      emit(toE164(country, raw));
    };

    const selectCountry = (c: Country) => {
      const rest = national.trim().startsWith("+") ? "" : national;
      setCountry(c);
      setNational(rest);
      emit(toE164(c, rest));
      setOpen(false);
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (country.iso === "RO") {
        const stripped = national.replace(/^\s*0/, "");
        if (stripped !== national) setNational(stripped);
      }
      onBlur?.(e);
    };

    const filtered = React.useMemo(() => {
      const q = fold(query.trim()).replace(/^\+/, "");
      if (!q) return null;
      const digits = q.replace(/\D/g, "");
      return ALL_COUNTRIES.filter(
        (c) =>
          fold(c.en).includes(q) ||
          fold(c.ro).includes(q) ||
          c.iso.toLowerCase() === q ||
          (digits.length > 0 && digits === q && c.dial.startsWith(digits)),
      );
    }, [query]);

    const item = (c: Country) => (
      <CommandItem
        key={`${c.iso}-${c.dial}`}
        value={c.iso}
        onSelect={() => selectCountry(c)}
        className="gap-2"
      >
        <span aria-hidden>{flagEmoji(c.iso)}</span>
        <span className="flex-1 truncate">{lang === "en" ? c.en : c.ro}</span>
        <span className="text-muted-foreground">+{c.dial}</span>
        <Check
          className={cn("h-4 w-4", c === country ? "opacity-100" : "opacity-0")}
        />
      </CommandItem>
    );

    const invalid =
      props["aria-invalid"] === true || props["aria-invalid"] === "true";

    return (
      <div className={cn("flex w-full", className)}>
        <Popover
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setQuery("");
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label={`${copy.prefix}: ${lang === "en" ? country.en : country.ro} +${country.dial}`}
              className={cn(
                "flex h-10 shrink-0 items-center gap-1 rounded-l-md border border-r-0 border-input bg-background px-3 text-sm ring-offset-background hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                invalid && "border-destructive",
              )}
            >
              <span aria-hidden>{flagEmoji(country.iso)}</span>
              <span>+{country.dial}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={copy.search}
                value={query}
                onValueChange={setQuery}
              />
              <CommandList>
                <CommandEmpty>{copy.empty}</CommandEmpty>
                {filtered ? (
                  <CommandGroup>{filtered.map(item)}</CommandGroup>
                ) : (
                  <>
                    <CommandGroup heading={copy.popular}>
                      {PINNED_COUNTRIES.map(item)}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading={copy.all}>
                      {OTHER_COUNTRIES.map(item)}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          {...props}
          ref={(el) => {
            inputRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
          type="tel"
          inputMode="tel"
          disabled={disabled}
          value={national}
          onChange={(e) => handleInput(e.target.value)}
          onBlur={handleBlur}
          className={cn(
            "rounded-l-none",
            invalid && "border-destructive focus-visible:ring-destructive",
          )}
        />
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
