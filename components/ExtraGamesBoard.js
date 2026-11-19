import Link from "next/link";
import { formatTime } from "@/lib/utils";

function ResultText({ value }) {
  const pending = String(value).toUpperCase() === "XX";
  return <span className={pending ? "result-pending" : undefined}>{value}</span>;
}

export default function ExtraGamesBoard({ games = [] }) {
  if (!games.length) return null;

  return (
    <section className="extra-games">
      <div className="text-center text-black px-4 py-2 bg-yellow-50 leading-6 text-lg">
        <h2>More Satta King Results – All Other Markets</h2>
      </div>
      <div className="row" id="extra-games">
        {games.map((game, index) => {
          const col = index === games.length - 1 && games.length % 2 === 1 ? "12" : "6";
          return (
            <div className={`gboardhalf col-md-${col} col-sm-${col} col-xs-${col}`} key={game._id}>
              <span className="gbgamehalf">{game.name}</span><br />
              {game.resultTime ? <><span className="gbhalftime">( {formatTime(game.resultTime)} )</span> <br /></> : null}
              <span className="gbhalfresulto"> [ <ResultText value={game.first} /> ]</span>
              <img src="/asset/arrow.gif" className="imggame" alt={`${game.name} satta result`} title={`${game.name} satta result`} />
              <span className="gbhalfresultn">[ <ResultText value={game.second} /> ] </span><br />
              <div className="gbhd"><Link href={`/${game.slug}/satta-result-chart`}>{game.name} Chart</Link></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
