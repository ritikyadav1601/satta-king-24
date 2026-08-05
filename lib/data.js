import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import { addDays, daysInMonth, formatResult, istDate, sanitizeColumn } from "@/lib/utils";
import Ad from "@/models/Ad";
import Contact from "@/models/Contact";
import Game from "@/models/Game";
import GameResult from "@/models/GameResult";
import { DEFAULT_CONTACT_NUMBER, DEFAULT_KHAIWAL_NAME, withDefaultAd } from "@/lib/contactDefaults";

function plain(doc) {
  return JSON.parse(JSON.stringify(doc));
}

function stringifyId(value) {
  return value ? String(value) : "";
}

function serializeGame(game) {
  return {
    ...game,
    _id: stringifyId(game._id)
  };
}

function serializeResult(result) {
  return {
    ...result,
    _id: stringifyId(result._id),
    game: stringifyId(result.game)
  };
}

function hasMongo() {
  return Boolean(process.env.MONGODB_URI);
}

function timeToMinutes(time = "") {
  const [hours, minutes] = String(time).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

function currentIstMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(map.hour) * 60 + Number(map.minute);
}

function currentResultBoardDate() {
  const today = istDate();
  return currentIstMinutes() < 180 ? addDays(today, -1) : today;
}

function monthlyChartOrder(game) {
  const order = new Map([
    ["desawer", 0],
    ["desawar", 0],
    ["shiv dham", 1],
    ["pushkar bazar", 2],
    ["delhi metro", 3],
    ["delhi bazar", 4],
    ["shri sayam", 5],
    ["shri shyam", 5],
    ["shri ganesh", 6],
    ["kolmbia", 7],
    ["faridabad", 8],
    ["makka-madina", 9],
    ["ghaziabad", 10],
    ["kalka night", 11],
    ["gali", 12]
  ]);
  const name = String(game.name).toLowerCase().trim();
  return order.has(name) ? order.get(name) : 100 + timeToMinutes(game.resultTime);
}

const getCachedActiveGames = unstable_cache(
  async (sort = "time") => {
    await connectDB();
    const order = sort === "show" ? { showIndex: 1, resultTime: 1 } : { resultTime: 1, showIndex: 1 };
    const games = await Game.find({ isActive: true })
      .select({ name: 1, code: 1, resultTime: 1, showIndex: 1, mid: 1 })
      .sort(order)
      .lean();
    return games.map(serializeGame);
  },
  ["active-games"],
  { revalidate: 300 }
);

const getCachedContact = unstable_cache(
  async () => {
    await connectDB();
    const contact = (await Contact.findOne().select({ name: 1, contactNumber: 1 }).lean()) || {};
    return {
      ...contact,
      _id: stringifyId(contact._id),
      name: contact.name || DEFAULT_KHAIWAL_NAME,
      contactNumber: contact.contactNumber || DEFAULT_CONTACT_NUMBER
    };
  },
  ["site-contact"],
  { revalidate: 300 }
);

const getCachedAds = unstable_cache(
  async () => {
    await connectDB();
    const ads = await Ad.find()
      .select({ khaiwalName: 1, gpayNumber: 1, whatsappNumber: 1, website: 1 })
      .sort({ sqlId: 1, createdAt: 1 })
      .lean();
    return ads.map((ad) => ({
      ...withDefaultAd(ad),
      _id: stringifyId(ad._id)
    }));
  },
  ["site-ads"],
  { revalidate: 1 }
);

const getCachedGameResultsForDates = unstable_cache(
  async (gameIds, dateKeys) => {
    await connectDB();
    const results = await GameResult.find({
        game: { $in: gameIds },
        resultDate: { $in: dateKeys }
      })
        .select({ game: 1, resultDate: 1, result: 1, updatedAt: 1 })
        .lean();
    return results.map(serializeResult);
  },
  ["game-results-for-dates"],
  { revalidate: 1 }
);

const getCachedMonthlyGameResults = unstable_cache(
  async (gameIds, start, end) => {
    await connectDB();
    const results = await GameResult.find({
        game: { $in: gameIds },
        resultDate: { $gte: start, $lte: end }
      })
        .select({ game: 1, resultDate: 1, result: 1 })
        .lean();
    return results.map(serializeResult);
  },
  ["monthly-game-results"],
  { revalidate: 30 }
);

const getCachedYearResults = unstable_cache(
  async (gameId, year) => {
    await connectDB();
    const results = await GameResult.find({
      game: gameId,
      resultDate: { $gte: `${year}-01-01`, $lte: `${year}-12-31` }
    })
      .select({ resultDate: 1, result: 1 })
      .lean();
    return results.map(({ resultDate, result }) => ({ resultDate, result }));
  },
  ["year-game-results"],
  { revalidate: 300 }
);

export async function getContact() {
  if (!hasMongo()) return { name: DEFAULT_KHAIWAL_NAME, contactNumber: DEFAULT_CONTACT_NUMBER };
  return getCachedContact();
}

export async function getAds() {
  if (!hasMongo()) {
    return [
      withDefaultAd(),
      withDefaultAd()
    ];
  }
  const ads = await getCachedAds();
  if (ads.length) return ads;
  return [
    withDefaultAd(),
    withDefaultAd()
  ];
}

export async function getActiveGames(sort = "time") {
  if (!hasMongo()) return [];
  return getCachedActiveGames(sort);
}

export async function getAdminGames() {
  if (!hasMongo()) return [];
  await connectDB();
  const games = await Game.find({ isActive: true }).sort({ showIndex: 1, resultTime: 1 }).lean();
  return games.map(serializeGame);
}

export async function getResultMap(dateKey) {
  if (!hasMongo()) return new Map();
  await connectDB();
  const rows = await GameResult.find({ resultDate: dateKey }).select({ game: 1, result: 1 }).lean();
  return new Map(rows.map((row) => [String(row.game), serializeResult(row)]));
}

export async function getGamesWithTodayResults() {
  const today = currentResultBoardDate();
  const yesterday = addDays(today, -1);
  const games = await getActiveGames("time");
  if (!games.length) return [];

  const rows = await getCachedGameResultsForDates(
    games.map((game) => game._id),
    [today, yesterday]
  );
  const resultMap = new Map(rows.map((row) => [`${row.game}:${row.resultDate}`, row]));

  return games.map((game) => ({
    ...game,
    first: formatResult(resultMap.get(`${game._id}:${yesterday}`)?.result || "XX"),
    second: formatResult(resultMap.get(`${game._id}:${today}`)?.result || "XX"),
    secondUpdatedAt: resultMap.get(`${game._id}:${today}`)?.updatedAt || null
  }));
}

export async function getTopGames(games) {
  const now = currentIstMinutes();
  const byTime = [...games].sort((a, b) => timeToMinutes(a.resultTime) - timeToMinutes(b.resultTime));
  const upcoming = byTime.find((game) => timeToMinutes(game.resultTime) > now && formatResult(game.second) === "XX")
    || byTime.find((game) => formatResult(game.second) === "XX");
  const recentlyUpdated = [...games]
    .filter((game) => formatResult(game.second) !== "XX")
    .sort((a, b) => new Date(b.secondUpdatedAt || 0) - new Date(a.secondUpdatedAt || 0))[0]
    || byTime.filter((game) => timeToMinutes(game.resultTime) <= now && formatResult(game.second) !== "XX").at(-1);

  if (!upcoming) {
    const nextGame = byTime[0];
    return [
      nextGame ? { ...nextGame, second: "XX", secondUpdatedAt: null } : null,
      recentlyUpdated && String(recentlyUpdated._id) !== String(nextGame?._id) ? recentlyUpdated : null
    ].filter(Boolean);
  }

  return [upcoming, recentlyUpdated || byTime.find((game) => String(game._id) !== String(upcoming._id))].filter(Boolean);
}

export async function getMonthlyRows({ year, month, untilToday = true, games: activeGames } = {}) {
  if (!hasMongo()) return { rows: [], games: [], gameColumns: [] };
  const today = istDate();
  const current = new Date(`${today}T00:00:00.000Z`);
  const y = year || current.getUTCFullYear();
  const m = month || current.getUTCMonth() + 1;
  const limit =
    untilToday && y === current.getUTCFullYear() && m === current.getUTCMonth() + 1
      ? current.getUTCDate()
      : daysInMonth(y, m);

  const games = [...(activeGames || (await getActiveGames("time")))].sort((a, b) => monthlyChartOrder(a) - monthlyChartOrder(b));
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const end = `${y}-${String(m).padStart(2, "0")}-${String(limit).padStart(2, "0")}`;
  const results = await getCachedMonthlyGameResults(
    games.map((game) => game._id),
    start,
    end
  );
  const byDate = new Map();

  for (const result of results) {
    if (!byDate.has(result.resultDate)) byDate.set(result.resultDate, new Map());
    byDate.get(result.resultDate).set(result.game, formatResult(result.result || "-"));
  }

  const rows = [];
  for (let day = 1; day <= limit; day++) {
    const dateKey = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const row = { Date: `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}` };
    for (const game of games) {
      row[sanitizeColumn(game.name)] = byDate.get(dateKey)?.get(game._id) || "-";
    }
    rows.push(row);
  }

  return { rows, games, gameColumns: games.map((game) => sanitizeColumn(game.name)) };
}

export async function getYearChartRows(gameSlug, year) {
  if (!hasMongo()) return { rows: [], game: { name: gameSlug }, games: [] };
  const gameName = String(gameSlug).replace(/-/g, " ").trim().toLowerCase();
  const games = await getActiveGames("time");
  const game = games.find((item) => String(item.name).trim().toLowerCase() === gameName);
  const rows = Array.from({ length: 31 }, (_, index) => ({
    Date: index + 1,
    JAN: "-",
    FEB: "-",
    MAR: "-",
    APR: "-",
    MAY: "-",
    JUN: "-",
    JUL: "-",
    AUG: "-",
    SEP: "-",
    OCT: "-",
    NOV: "-",
    DEC: "-"
  }));

  if (!game) return { rows, game: { name: gameName }, games };

  const results = await getCachedYearResults(game._id, year);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  for (const result of results) {
    const [, month, day] = result.resultDate.split("-").map(Number);
    if (rows[day - 1]) rows[day - 1][months[month - 1]] = formatResult(result.result || "-");
  }

  return { rows, game, games };
}

export async function getResultsForDate(dateKey) {
  if (!hasMongo()) return [];
  await connectDB();
  const rows = await GameResult.find({ resultDate: dateKey }).populate("game").sort({ createdAt: 1 }).lean();
  return plain(rows);
}
