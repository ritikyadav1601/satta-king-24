import MonthlyChartTable from "@/components/MonthlyChartTable";
import PublicLayout from "@/components/PublicLayout";
import { getMonthlyRows } from "@/lib/data";
import { monthName, sanitizeColumn, shortMonthYear, slugify } from "@/lib/utils";

export const revalidate = 300;

const monthMap = new Map([
  ["jan", 0], ["january", 0], ["feb", 1], ["february", 1], ["mar", 2], ["march", 2],
  ["apr", 3], ["april", 3], ["may", 4], ["jun", 5], ["june", 5], ["jul", 6], ["july", 6],
  ["aug", 7], ["august", 7], ["sep", 8], ["september", 8], ["oct", 9], ["october", 9],
  ["nov", 10], ["november", 10], ["dec", 11], ["december", 11]
]);

function parseMonthYear(value = "") {
  const parts = value.replace(/^result-chart-/i, "").split("-").filter(Boolean);
  const year = Number(parts.at(-1));
  const monthNamePart = String(parts.at(-2) || parts[0] || "").toLowerCase();
  const short = monthNamePart.slice(0, 3);
  const monthIndex = monthMap.has(monthNamePart) ? monthMap.get(monthNamePart) : monthMap.get(short);
  const isValid = Number.isInteger(year) && monthIndex !== undefined;
  const date = isValid ? new Date(Date.UTC(year, monthIndex, 1)) : new Date();
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, dateKey: date.toISOString().slice(0, 10), isValid };
}

function parseGameSlug(slug = "") {
  const match = slug.match(/^(.+)-result-chart-(.+-\d{4})$/i);
  if (!match) return { gameName: "", monthPart: slug };
  return { gameName: match[1].replace(/-+/g, " ").trim(), monthPart: match[2] };
}

function displayNameFromColumn(column = "") {
  return column.replaceAll("_", " ").trim();
}

function isRealResult(value) {
  const result = String(value || "").trim().toUpperCase();
  return result !== "" && result !== "-" && result !== "XX";
}

function hasChartData(rows = [], columns = []) {
  return rows.some((row) => columns.some((column) => isRealResult(row[column])));
}

async function getChartRouteInfo(slug = "") {
  const decodedSlug = decodeURIComponent(slug);
  const { gameName, monthPart } = parseGameSlug(decodedSlug);
  const { year, month, dateKey, isValid } = parseMonthYear(monthPart || decodedSlug);
  const monthly = await getMonthlyRows({ year, month, untilToday: false });
  const selectedColumn = gameName ? monthly.gameColumns.find((column) => sanitizeColumn(gameName).toLowerCase() === column.toLowerCase()) : "";
  const selectedName = selectedColumn ? displayNameFromColumn(selectedColumn) : "";
  const canonicalSlug = selectedColumn
    ? `${slugify(selectedName)}-result-chart-${shortMonthYear(dateKey)}`
    : `result-chart-${shortMonthYear(dateKey)}`;
  const columns = selectedColumn ? [selectedColumn] : monthly.gameColumns;
  const isIndexable = isValid && (!gameName || Boolean(selectedColumn)) && hasChartData(monthly.rows, columns);

  return { dateKey, gameName, selectedColumn, selectedName, monthly, canonicalPath: `/chart/${canonicalSlug}`, isIndexable };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { dateKey, gameName, selectedName, canonicalPath, isIndexable } = await getChartRouteInfo(resolvedParams.slug || "");
  const label = selectedName || "Satta King";
  const chartMonth = monthName(dateKey);
  const title = selectedName
    ? `${label} Result Chart ${chartMonth} - Satta King 24`
    : `Satta King Result Chart ${chartMonth} - Old Record`;

  return {
    title,
    description: selectedName
      ? `Check ${label} result chart for ${chartMonth}. View daily Satta King old record, monthly history and updated chart data at Satta-King-24.com.`
      : `Check Satta King result chart for ${chartMonth}. View all market old records, daily results and monthly chart history at Satta-King-24.com.`,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description: selectedName
        ? `Check ${label} result chart for ${chartMonth} with daily old records and monthly history.`
        : `Check Satta King result chart for ${chartMonth} with all market old records.`,
      url: canonicalPath,
      siteName: "Satta King 24",
      type: "website"
    },
    robots: isIndexable ? { index: true, follow: true } : { index: false, follow: true }
  };
}

export default async function LegacyChartPage({ params }) {
  const resolvedParams = await params;
  const { dateKey, gameName, selectedColumn, monthly } = await getChartRouteInfo(resolvedParams.slug || "");
  const columns = selectedColumn ? [selectedColumn] : monthly.gameColumns;
  const title = selectedColumn ? `${gameName.toUpperCase()} Result Chart ${monthName(dateKey)}` : `Satta King Record Chart ${monthName(dateKey)}`;

  return (
    <PublicLayout>
      <MonthlyChartTable title={title} rows={monthly.rows} columns={columns} dateKey={dateKey} chunkSize={4} />
    </PublicLayout>
  );
}
