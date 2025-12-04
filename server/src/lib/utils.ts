export const cls = (...c: (string | false | undefined | null)[]) =>
  c.filter(Boolean).join(" ");
