import Link from "next/link";
import { formatTime, slugify } from "@/lib/utils";

function ResultText({ value }) {
  const pending = String(value).toUpperCase() === "XX";
  return <span className={pending ? "result-pending" : undefined}>{value}</span>;
}

function GameCard({ game }) {
  const year = new Date().getFullYear();
  return (
    <div className="responsive-copy border border-gray-300 text-center shadow-sm rounded-md py-2">
      <h2 className="text-lg text-blue-700 font-bold uppercase leading-tight px-1">{game.name}</h2>
      <p className="text-red-600 font-semibold">({formatTime(game.resultTime)})</p>
      <p className="text-lg md:text-xl font-bold">
        {"{ "}
        <ResultText value={game.first} />
        {" } "}
        <span className="text-green-600">➡</span> [ <ResultText value={game.second} /> ]
      </p>
      <div className="mt-3">
        <Link className="bg-blue-600 text-white inline-block text-sm px-4 py-1 w-full transition" href={`/year-chart/${slugify(game.name)}-result-chart-${year}`}>
          {game.name}
        </Link>
      </div>
    </div>
  );
}

export default function GameCards({ games }) {
  if (!games.length) {
    return <div className="p-4 text-center font-bold text-red-600">No active games found. Import SQL data from admin database backup.</div>;
  }

  return (
    <div className="bg-white py-8">
      <div className="grid grid-cols-2 gap-1">
        {games.map((game) => <GameCard key={game._id} game={game} />)}
      </div>
    </div>
  );
}
