import Link from "next/link";
import { notFound } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import {
  getExtraGameBySlug,
  getExtraGameMonthRows,
  getExtraGameTodayResult,
  getExtraGameYearRows
} from "@/lib/extraGames";
import { formatTime, istDate, monthName } from "@/lib/utils";

export const revalidate = 60;

function ResultText({ value }) {
  const result = value || "-";
  const pending = String(result).toUpperCase() === "XX";
  return <span className={pending ? "result-pending" : undefined}>{result}</span>;
}

function selectedYear(query, currentYear) {
  const year = Number(query?.year);
  return Number.isInteger(year) && year >= 2000 && year <= currentYear ? year : currentYear;
}

export async function generateMetadata({ params }) {
  const { game: slug } = await params;
  const game = await getExtraGameBySlug(slug);
  if (!game) return { title: "Chart not found - Satta King 24", robots: { index: false, follow: true } };

  const year = istDate().slice(0, 4);
  const path = `/${game.slug}/satta-result-chart`;
  const title = `${game.name} Satta Result Chart ${year} | Live Result & Old Record`;
  const description = `Check ${game.name} satta result today, monthly chart and ${year} yearly old record with date-wise results at Satta-King-24.com.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website" }
  };
}

export default async function ExtraGameChartPage({ params, searchParams }) {
  const [{ game: slug }, query] = await Promise.all([params, searchParams]);
  const game = await getExtraGameBySlug(slug);
  if (!game) notFound();

  const today = istDate();
  const [currentYear, currentMonth] = today.split("-").map(Number);
  const year = selectedYear(query, currentYear);
  const [todayResult, monthRows, yearData] = await Promise.all([
    getExtraGameTodayResult(game),
    getExtraGameMonthRows(game, currentYear, currentMonth),
    getExtraGameYearRows(game, year)
  ]);
  const basePath = `/${game.slug}/satta-result-chart`;

  return (
    <PublicLayout>
      <main>
        <div className="max-w-screen-xl px-4 mx-auto md:px-6" style={{ padding: "15px" }}>
          <h1 className="text-lg font-bold text-center text-gray-900 uppercase">{game.name} Satta Result Chart {year}</h1>
        </div>

        <section className="bg-white">
          <div className="text-center">
            <p className="pt-3 text-xl font-bold uppercase">{game.name}</p>
            {game.resultTime ? <p className="py-2 text-xl text-gray-800">{formatTime(game.resultTime)}</p> : null}
            <div className="flex items-center justify-center pb-3">
              <strong className="text-4xl"><ResultText value={todayResult.first} /> </strong>
              <span style={{ width: "49px" }}>
                <span style={{ display: "block" }}>
                  <img alt="" aria-hidden="true" src="/asset/next.webp" />
                </span>
              </span>
              <strong className="text-4xl"> <ResultText value={todayResult.second} /></strong>
            </div>
          </div>
        </section>

        <div className="chart">
          <div className="satta-table-container">
            <h2 className="align" style={{ color: "#000" }}>{game.name} Chart {monthName(today)}</h2>
            <div className="table-wrapper monthly-chart-responsive mb-8">
              <table className="newtable" cellPadding="0" cellSpacing="0" border="1">
                <tbody>
                  <tr>
                    <th>DATE</th>
                    <th>{game.name.toUpperCase()}</th>
                  </tr>
                  {monthRows.map((row) => (
                    <tr key={row.Date}>
                      <td className="sticky-col">{row.Date}</td>
                      <td><ResultText value={row.result} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="fluid-panel my-8">
          <h2 className="bg-yellow-400 text-black font-bold text-lg md:text-2xl text-center py-3 uppercase">
            {game.name} Yearly Chart {year}
          </h2>
          <div className="flex flex-wrap justify-center gap-2 py-3">
            {Array.from({ length: 5 }, (_, i) => currentYear - i).map((item) => (
              <Link
                key={item}
                href={item === currentYear ? basePath : `${basePath}?year=${item}`}
                className={`px-3 py-1 border rounded-md text-sm ${item === year ? "bg-black text-white" : "bg-white text-black"}`}
              >
                {item}
              </Link>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-400">
              <thead>
                <tr className="bg-[#5a2d0c] text-white text-sm md:text-base">
                  <th className="px-3 py-2 border border-gray-400">DATE</th>
                  {yearData.months.map((month) => <th className="px-3 py-2 border border-gray-400 whitespace-nowrap" key={month}>{month}</th>)}
                </tr>
              </thead>
              <tbody>
                {yearData.rows.map((row) => (
                  <tr className="bg-purple-50 text-center" key={row.Date}>
                    <td className="px-3 py-2 border border-gray-400 font-semibold text-sm md:text-base text-center">{row.Date}</td>
                    {yearData.months.map((month) => <td className="px-3 py-2 border border-gray-400 text-sm md:text-base" key={month}><ResultText value={row[month]} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <article className="blog-post">
          <h2>{game.name} Satta Result</h2>
          <p>
            This page shows the latest {game.name} result{game.resultTime ? ` (declared around ${formatTime(game.resultTime)})` : ""},
            the {monthName(today)} monthly chart and the full {year} yearly record. Results update automatically as soon as they are declared.
          </p>
          <p><Link href="/">Back to all Satta King 24 results</Link></p>
        </article>
      </main>
    </PublicLayout>
  );
}
