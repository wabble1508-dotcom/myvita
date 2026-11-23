export type DisplayFact = { label: string; value: string };

/** Ein Treffer aus der Websuche, bevor das Mitglied ihn übernimmt. */
export type RawHit = {
  url: string;
  title: string;
  snippet: string;
  facts: DisplayFact[];
};

export type ScanInput = { fullName: string; handle?: string; email?: string };
