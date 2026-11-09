"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SERVICES, serviceByName, formatDuration } from "@/lib/services";

const TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function prettyDate(value: string): string {
  const d = new Date(value + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const PHONE_RE = /^[+0-9][0-9 ()-]{6,17}$/;

export default function BookingForm() {
  const params = useSearchParams();
  const today = useMemo(() => todayStr(), []);

  const [step, setStep] = useState(1);
  // Preselect a service from ?service= (validated against the real list)
  const [service, setService] = useState(() => {
    const q = params.get("service") ?? "";
    return serviceByName(q) ? q : "";
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [area, setArea] = useState("");
  const [policy, setPolicy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [booked, setBooked] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [done, setDone] = useState(false);

  // Preselect a service from ?service= is done in the useState initializer above.

  // Load booked times when the date changes
  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    fetch(`/api/bookings?date=${date}`)
      .then((r) => (r.ok ? r.json() : { booked: [] }))
      .then((data) => {
        if (!cancelled) setBooked(Array.isArray(data.booked) ? data.booked : []);
      })
      .catch(() => {
        if (!cancelled) setBooked([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const chosen = service ? serviceByName(service) : undefined;

  function isPastSlot(slot: string): boolean {
    if (date !== today) return false;
    const now = new Date();
    const hour = Number(slot.slice(0, 2));
    return hour <= now.getHours();
  }

  function nextFromStep(current: number) {
    const next: Record<string, string> = {};
    if (current === 1 && !service) next.service = "Please choose a service.";
    if (current === 2 && !date) next.date = "Please pick a date.";
    else if (current === 2 && date < today)
      next.date = "Please pick a date from today onwards.";
    if (current === 3 && !time) next.time = "Please pick a time.";
    setErrors(next);
    if (Object.keys(next).length === 0) setStep(current + 1);
  }

  async function submit() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    if (!PHONE_RE.test(phone.trim()))
      next.phone = "Please enter a valid phone number.";
    if (!policy)
      next.policy = "Please accept the booking note to continue.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setApiError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          service,
          booking_date: date,
          booking_time: time,
          notes: notes.trim(),
          urgent,
          payment_method: paymentMethod,
          area: area.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setApiError(data.error || "Booking could not be saved. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setApiError("Booking could not be saved. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep(1);
    setService("");
    setDate("");
    setTime("");
    setName("");
    setPhone("");
    setNotes("");
    setUrgent(false);
    setPaymentMethod("cod");
    setArea("");
    setPolicy(false);
    setErrors({});
    setApiError("");
    setDone(false);
  }

  if (done && chosen) {
    return (
      <div className="rounded-3xl border border-blush bg-white p-8 text-center shadow-sm">
        <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blush text-2xl text-gold">
          ✓
        </p>
        <h2 className="mt-4 font-display text-3xl font-semibold">
          You are booked in
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-plum-soft">
          Thank you, {name.trim()}. Your booking request is in — the salon will
          confirm it, so please keep your phone nearby.
        </p>
        <dl className="mx-auto mt-6 max-w-sm space-y-2 rounded-2xl bg-ivory p-5 text-left text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-plum-soft">Service</dt>
            <dd className="font-semibold">{chosen.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-plum-soft">Date</dt>
            <dd className="font-semibold">{prettyDate(date)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-plum-soft">Time</dt>
            <dd className="font-semibold">{time}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-plum-soft">Price from</dt>
            <dd className="font-semibold text-gold">${chosen.priceFrom}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-plum-soft">Payment</dt>
            <dd className="font-semibold">Cash at salon</dd>
          </div>
          {urgent && (
            <div className="flex justify-between gap-4">
              <dt className="text-plum-soft">Speed</dt>
              <dd className="font-semibold">⚡ Fast — need it soon</dd>
            </div>
          )}
          {area.trim() && (
            <div className="flex justify-between gap-4">
              <dt className="text-plum-soft">Area</dt>
              <dd className="font-semibold">{area.trim()}</dd>
            </div>
          )}
        </dl>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-gold px-7 font-semibold text-white transition hover:bg-plum"
        >
          Book another appointment
        </button>
      </div>
    );
  }

  const steps = ["Service", "Date", "Time", "Details"];

  return (
    <div>
      {/* Step indicator */}
      <ol className="flex items-center gap-2" aria-label="Booking steps">
        {steps.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const finished = step > n;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                aria-current={active ? "step" : undefined}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  finished
                    ? "bg-gold text-white"
                    : active
                      ? "bg-plum text-white"
                      : "bg-blush text-plum-soft"
                }`}
              >
                {finished ? "✓" : n}
              </span>
              <span
                className={`hidden text-sm font-medium sm:block ${
                  active ? "text-plum" : "text-plum-soft"
                }`}
              >
                {label}
              </span>
              {n < 4 && <span className="h-px flex-1 bg-blush" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded-3xl border border-blush bg-white p-6 shadow-sm sm:p-8">
        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-semibold">
              1. Choose your service
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    setService(s.name);
                    setErrors({});
                  }}
                  aria-pressed={service === s.name}
                  className={`min-h-[64px] rounded-2xl border p-4 text-left transition ${
                    service === s.name
                      ? "border-gold bg-blush/50 ring-2 ring-gold/40"
                      : "border-blush hover:border-gold"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-lg font-semibold">
                      {s.name}
                    </span>
                    <span className="shrink-0 font-semibold text-gold">
                      from ${s.priceFrom}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-plum-soft">
                    {formatDuration(s.durationMin)} · {s.short}
                  </span>
                </button>
              ))}
            </div>
            {errors.service && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-700">
                {errors.service}
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl font-semibold">
              2. Pick a date
            </h2>
            <p className="mt-2 text-plum-soft">
              Booking for: <strong className="text-plum">{service}</strong>{" "}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-semibold text-gold underline underline-offset-4"
              >
                Change
              </button>
            </p>
            <label htmlFor="booking-date" className="mt-5 block font-medium">
              Date
            </label>
            <input
              id="booking-date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => {
                const v = e.target.value;
                setDate(v);
                setTime("");
                setBooked([]);
                setSlotsLoading(Boolean(v));
                setErrors({});
              }}
              className="mt-2 min-h-[48px] w-full max-w-xs rounded-xl border border-blush bg-ivory px-4 text-base"
            />
            {errors.date && (
              <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                {errors.date}
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-2xl font-semibold">
              3. Pick a time
            </h2>
            <p className="mt-2 text-plum-soft">
              {service} · {date ? prettyDate(date) : "no date yet"}{" "}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="font-semibold text-gold underline underline-offset-4"
              >
                Change date
              </button>
            </p>
            {slotsLoading ? (
              <p className="mt-5 text-plum-soft">Checking open times…</p>
            ) : (
              <div className="mt-5 grid grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const taken = booked.includes(slot) || isPastSlot(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={taken}
                      onClick={() => {
                        setTime(slot);
                        setErrors({});
                      }}
                      aria-pressed={time === slot}
                      className={`min-h-[48px] rounded-xl border text-base font-semibold transition ${
                        taken
                          ? "cursor-not-allowed border-blush bg-ivory text-plum-soft/40 line-through"
                          : time === slot
                            ? "border-gold bg-gold text-white"
                            : "border-blush bg-white hover:border-gold hover:text-gold"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-4 text-sm text-plum-soft">
              Greyed-out times are already booked. Times are shown for one
              appointment at a time.
            </p>
            {errors.time && (
              <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                {errors.time}
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-display text-2xl font-semibold">
              4. Your details
            </h2>
            <p className="mt-2 text-plum-soft">
              {service} · {date ? prettyDate(date) : ""} at {time}
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="booking-name" className="block font-medium">
                  Your name
                </label>
                <input
                  id="booking-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-2 min-h-[48px] w-full rounded-xl border border-blush bg-ivory px-4 text-base"
                />
                {errors.name && (
                  <p role="alert" className="mt-2 text-sm font-medium text-red-700">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="booking-phone" className="block font-medium">
                  Phone number
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +977 98XXXXXXXX"
                  className="mt-2 min-h-[48px] w-full rounded-xl border border-blush bg-ivory px-4 text-base"
                />
                {errors.phone && (
                  <p role="alert" className="mt-2 text-sm font-medium text-red-700">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="booking-notes" className="block font-medium">
                  Notes <span className="font-normal text-plum-soft">(optional)</span>
                </label>
                <textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Design idea, allergies, or anything we should know"
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-blush bg-ivory px-4 py-3 text-base"
                />
              </div>
              <div>
                <label htmlFor="booking-area" className="block font-medium">
                  Your area / city{" "}
                  <span className="font-normal text-plum-soft">(optional)</span>
                </label>
                <input
                  id="booking-area"
                  type="text"
                  autoComplete="address-level2"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Damak, Kathmandu"
                  maxLength={80}
                  className="mt-2 min-h-[48px] w-full rounded-xl border border-blush bg-ivory px-4 text-base"
                />
              </div>
              <fieldset>
                <legend className="block font-medium">Payment</legend>
                <div className="mt-2 space-y-2">
                  <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-blush bg-ivory px-4">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="h-5 w-5 accent-[#c9a227]"
                    />
                    <span>
                      <span className="font-medium">Cash at salon (COD)</span>
                      <span className="block text-sm text-plum-soft">
                        Pay when your appointment is done.
                      </span>
                    </span>
                  </label>
                  <label className="flex min-h-[48px] items-center gap-3 rounded-xl border border-blush bg-ivory/60 px-4 opacity-60">
                    <input type="radio" name="payment" disabled className="h-5 w-5" />
                    <span>
                      <span className="font-medium">Pay online</span>
                      <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-xs font-semibold text-plum">
                        coming soon
                      </span>
                      <span className="block text-sm text-plum-soft">
                        Online payment is not available yet.
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>
              <label className="flex items-start gap-3 text-[15px] leading-relaxed">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[#c9a227]"
                />
                <span>
                  <strong>I need it fast ⚡</strong> — please fit me in as soon
                  as you can.
                </span>
              </label>
              <label className="flex items-start gap-3 text-[15px] leading-relaxed">
                <input
                  type="checkbox"
                  checked={policy}
                  onChange={(e) => setPolicy(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[#c9a227]"
                />
                <span>
                  I understand my booking is a request until the salon confirms
                  it, and I will let GlossnGrace know if I need to cancel or
                  reschedule.
                </span>
              </label>
              {errors.policy && (
                <p role="alert" className="-mt-2 text-sm font-medium text-red-700">
                  {errors.policy}
                </p>
              )}
              {apiError && (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                  {apiError}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setStep(step - 1);
              }}
              className="inline-flex min-h-[48px] items-center rounded-full border border-plum/25 px-6 font-semibold transition hover:border-gold hover:text-gold"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => nextFromStep(step)}
              className="inline-flex min-h-[48px] items-center rounded-full bg-gold px-8 font-semibold text-white transition hover:bg-plum"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex min-h-[48px] items-center rounded-full bg-gold px-8 font-semibold text-white transition hover:bg-plum disabled:opacity-60"
            >
              {submitting ? "Booking…" : "Book Appointment"}
            </button>
          )}
          {step === 1 && (
            <Link
              href="/services"
              className="font-semibold text-gold underline underline-offset-4"
            >
              See all services and prices
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
