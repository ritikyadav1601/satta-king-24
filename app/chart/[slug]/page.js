import MonthlyChartTable from "@/components/MonthlyChartTable";
import PublicLayout from "@/components/PublicLayout";
import { getMonthlyRows } from "@/lib/data";
import { monthName, sanitizeColumn } from "@/lib/utils";

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
  const date = Number.isInteger(year) && monthIndex !== undefined ? new Date(Date.UTC(year, monthIndex, 1)) : new Date();
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, dateKey: date.toISOString().slice(0, 10) };
}

function parseGameSlug(slug = "") {
  const match = slug.match(/^(.+)-result-chart-(.+-\d{4})$/i);
  if (!match) return { gameName: "", monthPart: slug };
  return { gameName: match[1].replace(/-+/g, " ").trim(), monthPart: match[2] };
}

export default async function LegacyChartPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug || "");
  const { gameName, monthPart } = parseGameSlug(slug);
  const { year, month, dateKey } = parseMonthYear(monthPart || slug);
  const monthly = await getMonthlyRows({ year, month, untilToday: false });
  const selectedColumn = gameName ? monthly.gameColumns.find((column) => sanitizeColumn(gameName).toLowerCase() === column.toLowerCase()) : "";
  const columns = selectedColumn ? [selectedColumn] : monthly.gameColumns;
  const title = selectedColumn ? `${gameName.toUpperCase()} Result Chart ${monthName(dateKey)}` : `Satta King Record Chart ${monthName(dateKey)}`;

  return (
    <PublicLayout>
      <MonthlyChartTable title={title} rows={monthly.rows} columns={columns} dateKey={dateKey} chunkSize={4} />
    </PublicLayout>
  );
}
