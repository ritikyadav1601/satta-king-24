import Link from "next/link";
import { monthName, shortMonthYear } from "@/lib/utils";

function chunkColumns(columns, chunkSize) {
  const chunks = [];
  for (let index = 0; index < columns.length; index += chunkSize) {
    chunks.push(columns.slice(index, index + chunkSize));
  }
  return chunks;
}

function displayGameName(game) {
  const name = game.replaceAll("_", " ").trim();
  const normalized = name.toLowerCase();
  const shortNames = {
    desawer: "DS",
    desawar: "DS",
    "shiv dham": "SHDM",
    "pushkar bazar": "PKB",
    "delhi metro": "Delhi M",
    "delhi bazar": "DB",
    "shri sayam": "Shri Sym",
    "shri shyam": "Shri Sym",
    "shri ganesh": "SG",
    kolmbia: "KLB",
    faridabad: "FB",
    "makka madina": "MM",
    "makka-madina": "MM",
    ghaziabad: "GZBD",
    "kalka night": "KLKN",
    gali: "GALI",
    fatehabad: "FTHBD",
    alwar: "ALWAR",
    "shakti peeth": "SKTP"
  };

  return shortNames[normalized] || name.toUpperCase();
}

function ResultText({ value }) {
  const result = value || "-";
  const pending = String(result).toUpperCase() === "XX";
  return <span className={pending ? "result-pending" : undefined}>{result}</span>;
}

function ChartTables({ rows, chunks }) {
  return chunks.map((group, groupIndex) => (
    <table key={groupIndex} className="newtable" cellPadding="0" cellSpacing="0" border="1">
      <tbody>
        <tr>
          <th>DATE</th>
          {group.map((game) => <th key={game}>{displayGameName(game)}</th>)}
        </tr>
        {rows.map((row, rowIndex) => (
          <tr key={`${groupIndex}-${row.Date}-${rowIndex}`}>
            <td className="sticky-col">{row.Date}</td>
            {group.map((game) => <td key={game}><ResultText value={row[game]} /></td>)}
          </tr>
        ))}
      </tbody>
    </table>
  ));
}

function monthLink(dateKey, offset) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return `/chart/result-chart-${shortMonthYear(date.toISOString().slice(0, 10))}`;
}

function monthLabel(dateKey, offset) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return monthName(date.toISOString().slice(0, 10));
}

export default function MonthlyChartTable({ title, rows, columns, dateKey, chunkSize = 10 }) {
  const chunks = chunkColumns(columns, chunkSize);
  const chartDateKey = dateKey || new Date().toISOString().slice(0, 10);

  return (
    <div className="chart">
      <div className="satta-table-container">
        <h2 className="align" style={{ color: "#000" }}>{title}</h2>
        <div className="table-wrapper monthly-chart-responsive mb-8">
          <ChartTables rows={rows} chunks={chunks} />
        </div>
        <div className="monthly-chart-nav">
          <Link className="monthly-chart-nav-btn" href={monthLink(chartDateKey, -1)}>
            {monthLabel(chartDateKey, -1)}
          </Link>
          <Link className="monthly-chart-nav-btn" href={monthLink(chartDateKey, 1)}>
            {monthLabel(chartDateKey, 1)}
          </Link>
        </div>
      </div>
    </div>
  );
}
