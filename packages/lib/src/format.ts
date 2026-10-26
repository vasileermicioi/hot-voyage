/** Localized display formatting. Prices are stored as integer cents. */

export function formatPrice(
  cents: number,
  currency = "USD",
  locale = "en-US",
): string {
  let code = currency || "USD";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
    }).format(cents / 100);
  } catch {
    code = "USD";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
    }).format(cents / 100);
  }
}

export function formatDate(ms: number, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(ms),
  );
}

export function formatDuration(days: number): string {
  if (days <= 0) return "Day trip";
  return days === 1 ? "1 day" : `${days} days`;
}

export function formatSeatsLeft(seatsLeft: number): string {
  if (seatsLeft <= 0) return "Sold out — join the waitlist";
  if (seatsLeft <= 3)
    return `Only ${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left — book soon`;
  return `${seatsLeft} seats left`;
}

export function formatCountdown(
  endsAt: number,
  now = Date.now(),
  locale = "en-US",
): string {
  const ms = endsAt - now;
  if (ms <= 0) return "Offer ended";
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    return `Ends ${rtf.format(days, "day")}`;
  }
  if (hours > 0) return `Ends in ${hours}h ${minutes}m`;
  return `Ends in ${minutes}m`;
}
