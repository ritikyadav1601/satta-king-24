import Link from "next/link";
import MonthlyChartTable from "@/components/MonthlyChartTable";
import PublicLayout from "@/components/PublicLayout";
import { getGamesWithTodayResults, getMonthlyRows, getTopGames } from "@/lib/data";
import { DEFAULT_CONTACT_NUMBER, DEFAULT_KHAIWAL_NAME } from "@/lib/contactDefaults";
import { formatTime, istDate, monthName } from "@/lib/utils";

export const revalidate = 30;

export const metadata = {
  title: "Satta King 24 Fast Result Today | Live Chart & Leak Number",
  description: "Check Satta King result today fast and easy. Get Gali, Desawar, Faridabad live result, daily number update and full old chart in simple format."
};

function ResultText({ value }) {
  const pending = String(value).toUpperCase() === "XX";
  return <span className={pending ? "result-pending" : undefined}>{value}</span>;
}

function normalizeName(name = "") {
  return String(name).toLowerCase().trim();
}

function timeToMinutes(time = "") {
  const [hours, minutes] = String(time).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

const liveGameOrder = [
  "desawer",
  "desawar",
  "gali",
  "ghaziabad",
  "faridabad",
  "delhi bazar",
  "shri ganesh",
  "shiv dham",
  "pushkar bazar",
  "delhi metro",
  "shri sayam",
  "shri shyam",
  "kolmbia",
  "makka-madina",
  "kalka night"
];

const liveFeaturedMids = new Set([3, 10]);
const khaiwalSchedule = [
  ["शिवधाम", "01:20 PM"],
  ["पुष्कर बाजार", "02:20 PM"],
  ["दिल्ली मेट्रो", "03:00 PM"],
  ["श्री श्याम", "04:10 PM"],
  ["कोलंबिया", "05:00 PM"],
  ["फरीदाबाद", "05:50 PM"],
  ["मक्का मदीना", "07:20 PM"],
  ["गाज़ियाबाद", "08:20 PM"],
  ["कालका नाइट", "09:50 PM"],
  ["गली", "11:20 PM"],
  ["दिसावर", "03:20 AM"]
];

function orderLikeLiveSite(games) {
  const order = new Map(liveGameOrder.map((name, index) => [name, index]));
  return [...games].sort((a, b) => {
    const aOrder = order.get(normalizeName(a.name)) ?? 1000;
    const bOrder = order.get(normalizeName(b.name)) ?? 1000;
    if (aOrder !== bOrder) return aOrder - bOrder;
    if ((a.showIndex ?? 0) !== (b.showIndex ?? 0)) return (a.showIndex ?? 0) - (b.showIndex ?? 0);
    return timeToMinutes(a.resultTime) - timeToMinutes(b.resultTime);
  });
}

function displayGameName(name = "") {
  const display = new Map([
    ["desawer", "DESAWER"],
    ["desawar", "DESAWER"],
    ["gali", "GALI"],
    ["ghaziabad", "GHAZIABAD"],
    ["faridabad", "FARIDABAD"],
    ["delhi bazar", "Delhi BAZAR"],
    ["shri ganesh", "Shri Ganesh"],
    ["shiv dham", "Shiv Dham"],
    ["pushkar bazar", "Pushkar Bazar"],
    ["delhi metro", "Delhi Metro"],
    ["shri sayam", "Shri Sayam"],
    ["shri shyam", "Shri Sayam"],
    ["kolmbia", "Kolmbia"],
    ["makka-madina", "Makka-Madina"],
    ["kalka night", "Kalka Night"]
  ]);
  return display.get(normalizeName(name)) || name;
}

function isPending(value) {
  const result = String(value || "").toUpperCase();
  return result === "XX" || result === "-";
}

function pickFeatured(games) {
  const midFeatured = games.filter((game) => liveFeaturedMids.has(Number(game.mid || 0)));
  if (midFeatured.length) return midFeatured;
  return games.filter((game) => !isPending(game.first) && isPending(game.second)).slice(0, 2);
}

function ResultHighlight({ game, pending = false }) {
  if (!game) return null;
  return (
    <div className="flex items-center justify-center space-y-4 text-sm text-gray-200" role="alert">
      <div className="text-2xl font-medium text-center md:font-medium md:text-base">
        <p className="mb-1 text-3xl font-bold text-white uppercase md:font-medium md:text-base" style={pending ? { padding: "15px" } : undefined}>
          {displayGameName(game.name)}
        </p>
        <span className="text-3xl font-bold lead text-gray-50">
          {pending ? <span className="loader"></span> : <ResultText value={game.second} />}
        </span>
      </div>
    </div>
  );
}

function FeaturedResult({ game }) {
  if (!game) return null;
  return (
    <section className="bg-white">
      <div className="text-center">
        <h3 className="pt-3 text-xl font-bold uppercase">{displayGameName(game.name)}</h3>
        <p className="py-2 text-xl text-gray-800"> {formatTime(game.resultTime)}</p>
        <div className="flex items-center justify-center">
          <strong className="text-4xl"><ResultText value={game.first} /> </strong>
          <span style={{ width: "49px" }}>
            <span style={{ display: "block" }}>
              <img alt="" aria-hidden="true" src="/asset/next.webp" />
            </span>
          </span>
          <strong className="text-4xl"> <ResultText value={game.second} /></strong>
        </div>
      </div>
    </section>
  );
}

function GameBoard({ games }) {
  return (
    <div className="row" id="games">
      {games.map((game, index) => (
        <div className={`gboardhalf col-md-${index === games.length - 1 ? "12" : "6"} col-sm-${index === games.length - 1 ? "12" : "6"} col-xs-${index === games.length - 1 ? "12" : "6"}`} key={game._id}>
          <font className="gbgamehalf">{displayGameName(game.name)}</font><br />
          <font className="gbhalftime">( {formatTime(game.resultTime)} )</font> <br />
          <font className="gbhalfresulto"> [ <ResultText value={game.first} /> ]</font>
          <img src="/asset/arrow.gif" className="imggame" alt="satta king live result" title="satta live result" />
          <font className="gbhalfresultn">[ <ResultText value={game.second} /> ] </font><br />
          <div className="gbhd"><Link href="/chart">{displayGameName(game.name)} Chart</Link></div>
        </div>
      ))}
    </div>
  );
}

function PlayBlock({ full = false }) {
  const name = DEFAULT_KHAIWAL_NAME;
  const pay = DEFAULT_CONTACT_NUMBER;
  const whatsapp = DEFAULT_CONTACT_NUMBER;

  return (
    <div id="kha" className="card-body sk24-khaiwal-card">
      {full ? (
        <div className="sk24-khaiwal-copy">
          <p>बिंदास गेम प्ले कर सकते हो आप बिना किसी टेंशन के</p>
          <p className="sk24-khaiwal-name">♕♕{name} ♕♕</p>
          <div className="sk24-khaiwal-schedule">
            {khaiwalSchedule.map(([game, time]) => (
              <div className="sk24-khaiwal-row" key={game}>
                <span>⏰ {game}</span>
                <span className="sk24-khaiwal-dots" aria-hidden="true"></span>
                <span>{time}</span>
              </div>
            ))}
          </div>
          <p className="sk24-khaiwal-payment">
            💸 Payment Option 💸<br />
            PAYTM//BANK TRANSFER//PHONE PAY//GOOGLE PAY =&gt;{pay}
          </p>
          <p className="sk24-khaiwal-separator">
            =====================================<br />
            👉 {pay}👈<br />
            =====================================
          </p>
          <p className="sk24-khaiwal-rate">
            🤑 Rate list 💸<br />
            जोड़ी रेट 10-------960<br />
            <br />
            हरूफ रेट 100-----960
          </p>
          <p className="sk24-khaiwal-name">♕♕ {name}♕♕</p>
        </div>
      ) : null}
      <p><strong>Game play करने के लिये नीचे लिंक पर क्लिक करे</strong></p>
      <a href={`https://wa.me/${whatsapp}`} className="Wbutton">
        <img loading="lazy" width="100%" src="/asset/whatsapp.png" alt="Whatsapp to Play Game" />
      </a>
    </div>
  );
}

function SeoContent() {
  return (
    <>
      <article className="blog-post">
        <h1>Satta King 24 - Fast Satta King Result and Daily Updates</h1>
        <p>Welcome to Satta King 24, where you can check the latest satta results and record charts in one place. Many people search online every day to see the newest numbers from different satta markets. This website helps you quickly find results without visiting multiple websites.</p>
        <p>The main purpose of this website is to show updated results and historical charts for different markets. Here you can easily check today's results as well as previous numbers that were announced in earlier days. The website is designed in a simple way so you can quickly understand the information and check results without confusion.</p>
        <p>Today most people prefer checking satta results online because it is faster and easier. Once the result is announced, you can quickly see the updated numbers on result websites.</p>
        <h2>Daily Satta Market Results</h2>
        <p>Every day many people search for results of different satta markets. On this website, you can check daily numbers for several popular markets that are followed across India.</p>
        <p>These markets include Shiv Dham, Pushkar Bazar, Delhi Metro, Delhi Bazar, Shri Sayam, Shri Ganesh, Kolmbia, Faridabad, Makka-Madina, Ghaziabad, Kalka Night, Gali, and Desawer. Each market declares its result at a specific time during the day, and you can check the numbers here as soon as they are announced.</p>
        <p>Checking results online saves time and gives quick updates. Instead of waiting for information from other sources, you can simply open the website and see the latest numbers instantly.</p>
        <h2>Satta Record Charts and Old Results</h2>
        <p>Apart from daily results, you can also <Link href="/chart">check old charts </Link> and past numbers on this website. Record charts display results from previous days, months, or even years. These charts help you understand the history of different markets and track past numbers easily.</p>
        <p>Many people check these charts to compare results and see previous numbers. The chart section keeps a record of past results so you can quickly find old numbers without searching through many pages.</p>
        <h2>History of Satta King</h2>
        <p>The concept of Satta King started many years ago and gradually became popular in different parts of India. Earlier, people placed bets based on cotton trading rates, and later the system changed into number-based games known as Satta Matka.</p>
        <p>With the growth of the internet, many websites started publishing satta results online so you can easily check numbers without visiting local places.</p>
      </article>
      <section className="faq-section">
        <h2>FAQs - Satta King 24</h2>
        <div className="faq-item"><h3>1. What is Satta King 24?</h3><p>Satta King 24 is an informational website where users can check daily satta results and record charts for different markets.</p></div>
        <div className="faq-item"><h3>2. Where can I check today Satta King result?</h3><p>You can check the latest satta results on <a href="https://satta-king-24.com" target="_blank" rel="noreferrer">satta-king-24.com</a>, where numbers are updated regularly after they are announced.</p></div>
        <div className="faq-item"><h3>3. Which markets results are available on this website?</h3><p>This website provides results and charts for many markets such as Shiv Dham, Pushkar Bazar, Delhi Metro, Delhi Bazar, Shri Sayam, Shri Ganesh, Kolmbia, Faridabad, Makka-Madina, Ghaziabad, Kalka Night, Gali, and Desawer.</p></div>
        <div className="faq-item"><h3>4. What are Satta record charts?</h3><p>Satta record charts show old results from previous days, months, or years so users can easily view past numbers.</p></div>
        <div className="faq-item"><h3>5. Can satta numbers be predicted?</h3><p>Some people try to analyze old charts and patterns to guess numbers, but the results are random and predictions are not guaranteed.</p></div>
        <div className="faq-item"><h3>6. Which Satta King number is the most likely to win?</h3><p>There is no specific number that is most likely to win because the result is random. Any number between 00 and 99 can be declared as the winning number.</p></div>
        <div className="faq-item"><h3>7. How to predict Satta King 24 number?</h3><p>Some people try to predict numbers by analyzing old charts and past results, but these predictions are not guaranteed to be correct.</p></div>
      </section>
      <section className="disclaimer-section p-3">
        <h2>Disclaimer</h2>
        <p>Satta King and related activities may be illegal in some regions. This website is for informational and entertainment purposes only and does not promote or support gambling. Users are responsible for how they use the information provided.</p>
      </section>
    </>
  );
}

function liveClockText() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(now);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(now);
  return `${date} ${time}`;
}

export default async function HomePage() {
  const games = await getGamesWithTodayResults();
  const liveGames = orderLikeLiveSite(games);
  const monthly = await getMonthlyRows({ untilToday: true, games: liveGames });
  const topGames = await getTopGames(liveGames);
  const featured = pickFeatured(liveGames);
  const today = istDate();

  return (
    <PublicLayout>
      <main>
        <div className="max-w-screen-xl px-4 mx-auto md:px-6" style={{ padding: "15px" }}>
          <h1 className="text-lg font-bold text-center text-gray-900 uppercase">Welcome to Satta King 24</h1>
        </div>
        <div className="py-2 text-lg font-bold text-center text-black bg-white digital-clock">{liveClockText()}</div>
        <div className="w-full mx-auto mb-3 bg-black pb-2 overflow-hidden">
          <ResultHighlight game={topGames[1]} pending />
          <ResultHighlight game={topGames[0]} />
        </div>
        {featured.map((game) => <FeaturedResult key={game._id} game={game} />)}
        <PlayBlock />
        <section className="grid grid-cols-1 gap-2 bg-white lg:grid-cols-1">
          <div className="text-center text-black px-4 py-2 shadow-xl bg-yellow-50 border pt-4 mx-2 my-2 rounded-xl leading-6 font-semibold h-fit px-0 mx-0 pt-2 py-2 leading-6 border-transparent rounded-none font-normal shadow none text-lg">
            <h3>To Check instant SATTA KING 24 Results, Check Below Chart 👇🏿</h3>
          </div>
        </section>
        <h3 className="py-2 text-sm font-semibold text-center text-gray-900 bg-white">FASTEST SATTA KING RESULT SITE ON INTERNET</h3>
        <GameBoard games={liveGames} />
        <PlayBlock full />
        <MonthlyChartTable title={`Satta King Record Chart ${monthName(today)}`} rows={monthly.rows} columns={monthly.gameColumns} dateKey={today} chunkSize={4} />
        <SeoContent />
      </main>
    </PublicLayout>
  );
}
