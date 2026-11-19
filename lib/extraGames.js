import { unstable_cache } from "next/cache";
import { connectExtraGamesDB, getExtraGamesModels, hasExtraGamesMongo } from "@/lib/extraGamesDb";
import { currentResultBoardDate } from "@/lib/data";
import { addDays, daysInMonth, formatResult, istDate, slugify } from "@/lib/utils";

// Names in the extra DB that are the same market as a game already on the main board.
const NAME_ALIASES = new Map([
  ["deshawer", "desawer"],
  ["desawar", "desawer"],
  ["disawar", "desawer"],
  ["puranigali", "gali"],
  ["shrishyam", "shrisayam"]
]);

function canonicalName(name = "") {
  const key = String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  return NAME_ALIASES.get(key) || key;
}

function timeToMinutes(time = "") {
  const [hours, minutes] = String(time).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 24 * 60;
  return hours * 60 + minutes;
}

function displayResult(value) {
  const result = formatResult(value || "");
  return result || "XX";
}

const getCachedExtraGames = unstable_cache(
  async () => {
    const connection = await connectExtraGamesDB();
    const { Game } = getExtraGamesModels(connection);
    const games = await Game.find({ isActive: { $ne: false } })
      .select({ name: 1, code: 1, resultTime: 1, showIndex: 1 })
      .lean();

    const seen = new Set();
    return games
      .map((game) => ({
        _id: String(game._id),
        name: String(game.name || "").trim(),
        slug: slugify(game.name),
        resultTime: game.resultTime || "",
        showIndex: game.showIndex ?? 0
      }))
      .filter((game) => game.slug && !seen.has(game.slug) && seen.add(game.slug))
      .sort((a, b) => timeToMinutes(a.resultTime) - timeToMinutes(b.resultTime) || a.showIndex - b.showIndex);
  },
  ["extra-games-list"],
  { revalidate: 300 }
);

const getCachedResultsForDates = unstable_cache(
  async (gameIds, dateKeys) => {
    const connection = await connectExtraGamesDB();
    const { GameResult } = getExtraGamesModels(connection);
    const rows = await GameResult.find({ game: { $in: gameIds }, resultDate: { $in: dateKeys } })
      .select({ game: 1, resultDate: 1, result: 1 })
      .lean();
    return rows.map((row) => ({ game: String(row.game), resultDate: row.resultDate, result: row.result }));
  },
  ["extra-games-results-for-dates"],
  { revalidate: 30 }
);

const getCachedResultsInRange = unstable_cache(
  async (gameId, start, end) => {
    const connection = await connectExtraGamesDB();
    const { GameResult } = getExtraGamesModels(connection);
    const rows = await GameResult.find({ game: gameId, resultDate: { $gte: start, $lte: end } })
      .select({ resultDate: 1, result: 1 })
      .lean();
    return rows.map((row) => ({ resultDate: row.resultDate, result: row.result }));
  },
  ["extra-games-results-range"],
  { revalidate: 60 }
);

export async function getExtraGamesList() {
  if (!hasExtraGamesMongo()) return [];
  return getCachedExtraGames();
}

export async function getExtraGameBySlug(slug = "") {
  const games = await getExtraGamesList();
  const key = String(slug).toLowerCase();
  return games.find((game) => game.slug === key) || null;
}

/**
 * Home page: every active game in the extra DB that isn't already on the main
 * board, with yesterday's and today's result. Never throws.
 */
export async function getExtraGamesWithResults(mainGames = []) {
  if (!hasExtraGamesMongo()) return [];
  try {
    const mainNames = new Set(mainGames.map((game) => canonicalName(game.name)));
    const games = (await getExtraGamesList()).filter((game) => !mainNames.has(canonicalName(game.name)));
    if (!games.length) return [];

    const today = currentResultBoardDate();
    const yesterday = addDays(today, -1);
    const rows = await getCachedResultsForDates(games.map((game) => game._id), [today, yesterday]);
    const map = new Map(rows.map((row) => [`${row.game}:${row.resultDate}`, row.result]));

    return games.map((game) => ({
      ...game,
      first: displayResult(map.get(`${game._id}:${yesterday}`)),
      second: displayResult(map.get(`${game._id}:${today}`))
    }));
  } catch (error) {
    console.error("extra games: could not load", error);
    return [];
  }
}

export async function getExtraGameTodayResult(game) {
  const today = currentResultBoardDate();
  const yesterday = addDays(today, -1);
  const rows = await getCachedResultsForDates([game._id], [today, yesterday]);
  const map = new Map(rows.map((row) => [row.resultDate, row.result]));
  return { first: displayResult(map.get(yesterday)), second: displayResult(map.get(today)) };
}

export async function getExtraGameMonthRows(game, year, month) {
  const [ty, tm, td] = istDate().split("-").map(Number);
  const limit = year === ty && month === tm ? td : daysInMonth(year, month);
  const mm = String(month).padStart(2, "0");
  const results = await getCachedResultsInRange(game._id, `${year}-${mm}-01`, `${year}-${mm}-${String(limit).padStart(2, "0")}`);
  const byDate = new Map(results.map((row) => [row.resultDate, formatResult(row.result || "-")]));

  return Array.from({ length: limit }, (_, index) => {
    const dd = String(index + 1).padStart(2, "0");
    return { Date: `${dd}/${mm}`, result: byDate.get(`${year}-${mm}-${dd}`) || "-" };
  });
}

export async function getExtraGameYearRows(game, year) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const rows = Array.from({ length: 31 }, (_, index) => {
    const row = { Date: index + 1 };
    for (const month of months) row[month] = "-";
    return row;
  });
  const results = await getCachedResultsInRange(game._id, `${year}-01-01`, `${year}-12-31`);
  for (const result of results) {
    const [, month, day] = String(result.resultDate).split("-").map(Number);
    if (rows[day - 1] && months[month - 1]) rows[day - 1][months[month - 1]] = formatResult(result.result || "-");
  }
  return { rows, months };
}
