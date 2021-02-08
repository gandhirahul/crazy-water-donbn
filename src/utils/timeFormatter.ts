/**
 *
 * A utility for formatting relative elapsed time
 *
 * Source: https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time 🙌
 */

const units = {
  // in miliseconds
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000
};

const rtf = new Intl.RelativeTimeFormat("en", {
  style: "narrow",
  numeric: "always"
});

const getRelativeTime = (d1, d2 = new Date().getTime()) => {
  const elapsed = d1 - d2;

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const u in units) {
    if (Math.abs(elapsed) > units[u] || u === "second") {
      return rtf.format(Math.round(elapsed / units[u]), u);
    }
  }
};

export { getRelativeTime };
