import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhone } from "@/components/RegistrationForm/LeadFields";
import { countryForDigits } from "@/data/countries";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/**
 * The phone field must hand the form a clean E.164 number whatever the
 * visitor types: the Romanian `07…` habit, a pasted `+961 …`, or `00…`.
 */
function Harness({ initial = "", onValue }: { initial?: string; onValue: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <PhoneInput
      aria-label="phone"
      value={v}
      onChange={(next) => {
        setV(next);
        onValue(next);
      }}
    />
  );
}

vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ lang: "ro" }) }));

afterEach(cleanup);

const type = (value: string) => fireEvent.change(screen.getByLabelText("phone"), { target: { value } });

describe("PhoneInput", () => {
  it("drops the Romanian trunk 0 from the emitted value as you type, and from the field on blur", () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    type("0721 234 567");
    expect(onValue).toHaveBeenLastCalledWith("+40721234567");
    const input = screen.getByLabelText("phone") as HTMLInputElement;
    fireEvent.blur(input);
    expect(input.value).toBe("721 234 567");
  });

  it("switches country when a dial code is typed", () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    type("+96");
    expect(screen.getByRole("button").textContent).toContain("+40");
    type("+961");
    expect(screen.getByRole("button").textContent).toContain("+961");
    type("3123456");
    expect(onValue).toHaveBeenLastCalledWith("+9613123456");
  });

  it("accepts a pasted 00 international number", () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    type("0044 7911 123456");
    expect(onValue).toHaveBeenLastCalledWith("+447911123456");
  });

  it("normalises a stored local number on mount", () => {
    const onValue = vi.fn();
    render(<Harness initial="0722 111 222" onValue={onValue} />);
    expect(onValue).toHaveBeenLastCalledWith("+40722111222");
  });

  it("emits an empty string when cleared", () => {
    const onValue = vi.fn();
    render(<Harness initial="+40722111222" onValue={onValue} />);
    type("");
    expect(onValue).toHaveBeenLastCalledWith("");
  });
});

describe("phone validation", () => {
  it("accepts E.164 only", () => {
    expect(isValidPhone("+40721234567")).toBe(true);
    expect(isValidPhone("+961 3 123 456")).toBe(true);
    expect(isValidPhone("0721234567")).toBe(false);
    expect(isValidPhone("+0721234567")).toBe(false);
  });
});

describe("countryForDigits", () => {
  it("resolves shared codes to one country", () => {
    expect(countryForDigits("1555")?.en).toBe("United States / Canada");
    expect(countryForDigits("7495")?.iso).toBe("RU");
    expect(countryForDigits("373")?.iso).toBe("MD");
  });
});

describe("buildWhatsAppUrl", () => {
  it("links desktop to WhatsApp Web and mobile to wa.me", () => {
    expect(buildWhatsAppUrl("0735 123 456")).toBe("https://web.whatsapp.com/send?phone=40735123456");
    expect(buildWhatsAppUrl("+961 3 123 456", "Salut!")).toBe(
      "https://web.whatsapp.com/send?phone=9613123456&text=Salut!",
    );
    const ua = vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (iPhone)");
    expect(buildWhatsAppUrl("0040735123456", "a b")).toBe("https://wa.me/40735123456?text=a+b");
    ua.mockRestore();
  });
});
