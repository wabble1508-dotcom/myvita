const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unbekanntes Datum";
  return stable(dateFormatter.format(date));
}

export function formatWhenTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unbekanntes Datum";
  return stable(dateTimeFormatter.format(date));
}

function stable(value: string): string {
  return value.replace(/\u202f|\u00a0/g, " ");
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
