import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/booking-form";

export const metadata: Metadata = {
  title: "Book an Appointment — GlossnGrace Nails",
  description:
    "Book your GlossnGrace appointment in four quick steps: pick a service, a date and a time, then leave your details. No account needed.",
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
        Book
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
        Book your appointment
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-plum-soft">
        Four quick steps, under a minute — no account needed. We will confirm
        your booking by phone.
      </p>
      <div className="mt-8">
        <Suspense
          fallback={
            <p className="rounded-3xl border border-blush bg-white p-8 text-plum-soft">
              Loading the booking form…
            </p>
          }
        >
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
