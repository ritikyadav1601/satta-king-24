import Link from "next/link";
import Clock from "@/components/Clock";
import MonthlyChartTable from "@/components/MonthlyChartTable";
import PublicLayout from "@/components/PublicLayout";
import { getAds, getContact, getGamesWithTodayResults, getMonthlyRows, getTopGames } from "@/lib/data";
import { DEFAULT_CONTACT_NUMBER, DEFAULT_KHAIWAL_NAME, normalizeWhatsAppNumber } from "@/lib/contactDefaults";
import { formatTime, istDate, monthName } from "@/lib/utils";

export const revalidate = 1;

function formatSeoDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function generateMetadata() {
  const currentDate = formatSeoDate();

  return {
    title: `Satta King Result ${currentDate} | Live Updates, Chart & Record`,
    description: `Get the latest Satta King Result for ${currentDate} with live updates, chart history, and daily records. Explore accurate information at Satta-King-24.com.`,
    alternates: {
      canonical: "https://www.satta-king-24.com",
    },
  };
}

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
  ["श्री गणेश", "04:20 PM"],
  ["कोलंबिया", "05:00 PM"],
  ["फरीदाबाद", "06:00 PM"],
  ["मक्का मदीना", "07:20 PM"],
  ["गाज़ियाबाद", "09:20 PM"],
  ["कालका नाइट", "09:50 PM"],
  ["गली", "11:20 PM"],
  ["दिसावर", "04:00 AM"]
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
        <p className="pt-3 text-xl font-bold uppercase">{displayGameName(game.name)}</p>
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
          <span className="gbgamehalf">{displayGameName(game.name)}</span><br />
          <span className="gbhalftime">( {formatTime(game.resultTime)} )</span> <br />
          <span className="gbhalfresulto"> [ <ResultText value={game.first} /> ]</span>
          <img src="/asset/arrow.gif" className="imggame" alt="satta king live result" title="satta live result" />
          <span className="gbhalfresultn">[ <ResultText value={game.second} /> ] </span><br />
          <div className="gbhd"><Link href="/chart">{displayGameName(game.name)} Chart</Link></div>
        </div>
      ))}
    </div>
  );
}

function PlayBlock({  full = false, whatsapp, name}) {


  return (
    <div id="kha" className="card-body sk24-khaiwal-card">
      {full ? (
        <div className="sk24-khaiwal-copy">
          <p>--सीधे सट्टा कंपनी का No 1 खाईवाल--</p>
          <p className="sk24-khaiwal-name">♕♕ {name} KHAIWAL♕♕</p>
          <div className="sk24-khaiwal-schedule">
            {khaiwalSchedule.map(([game, time]) => (
              <div className="sk24-khaiwal-row" key={game}>
                <span>⏰ {game}</span>
                <span className="sk24-khaiwal-dots" aria-hidden="true"></span>
                <span>{time}</span>
              </div>
            ))}
          </div>
          
          <p className="sk24-khaiwal-rate">
            🤑 Rate list 💸<br />
            जोड़ी रेट 10-------960<br />
            हरूफ रेट 100-----960 <br /><br />
           ----------- {whatsapp} ------------
          </p>
          
        </div>
      ) : null}
      <p><strong>Game play करने के लिये नीचे लिंक पर क्लिक करे</strong></p>
      <a
        href={`https://wa.me/${whatsapp}`}
        className="Wbutton"
      >
        <img loading="lazy" width="100%" src="/asset/whatsapp.png" alt="Whatsapp to Play Game" />
      </a>
    </div>
  );
}

function SeoContent() {
  return (
    <>
      <article className="blog-post">
        <h2>Welcome to Satta King 24</h2>
        <p>Satta King 24 is a popular platform where visitors can explore information related to
          Desawar, Gali, Faridabad, Ghaziabad, Delhi Bazar, Delhi Metro, Shri Ganesh, Shiv Dham,
          Pushkar Bazar, Kalka Night, Makka Madina, New Ganga, Gwalior, Fatehabad, Mathura,
          Alwar and many other market sections. Every day, users visit Satta King 24 to browse
          market pages, check chart records and discover information from different categories
          available on the website.</p>
        <p>The purpose of Satta King 24 is to organize important market information in a simple and
          accessible format. Visitors can move between multiple market pages without searching on
          different websites. Whether someone wants to explore Desawar, review Gali records, visit
          Faridabad pages or browse Ghaziabad information, everything is available in one place.</p>

        <h2>Check Popular Market Pages on Satta King 24</h2>
        <p>Satta King 24 brings together a wide range of market categories. The website helps visitors
          access different market sections through easy navigation and connected pages.
          Some of the most visited sections include Desawar, Gali, Faridabad, Ghaziabad, Delhi
          Bazar, Delhi Metro, Shri Ganesh, Shiv Dham and Pushkar Bazar. These pages are regularly
          explored by visitors who prefer accessing multiple market categories from a single platform.</p>
        <p>The website structure allows users to continue browsing related sections while discovering
          additional market pages available across the platform.</p>

        <h3>Desawar Market Information</h3>
        <p>Desawar remains one of the most recognized market categories available on Satta King 24.
          Many visitors begin their browsing experience by exploring the Desawar section before
          moving to other market pages.</p>
        <p>The Desawar page is connected with several important categories including Gali, Faridabad
          and Ghaziabad. This connection helps visitors continue exploring information without leaving
          the website.</p>

        <h3>Gali Market Information</h3>
        <p>The Gali section is another important part of Satta King 24. Visitors frequently access this
          page while browsing market-related information and chart records.</p>
        <p>Because Gali remains one of the most searched categories, the website provides easy
          navigation between Gali and other market sections.</p>

        <h3>Faridabad Market Information</h3>
        <p>Faridabad attracts visitors from different regions who regularly browse market pages and
          chart information. The dedicated Faridabad section helps users access information through
          a clean and organized layout.</p>
        <p>Visitors often continue exploring Ghaziabad and Delhi Bazar pages after visiting the
          Faridabad section.</p>

        <h3>Ghaziabad Market Information</h3>
        <p>Ghaziabad remains among the most popular market categories available on the platform.
          Visitors frequently browse this section while exploring chart pages and related information.
          The Ghaziabad page is connected with multiple market categories, helping users discover
          additional sections available on Satta King 24.</p>

        <h2>Market Charts Available on Satta King 24</h2>
        <p>Chart pages help visitors explore information related to different market categories. Satta
          King 24 includes chart sections for major markets and provides easy access to connected
          pages. Visitors can browse chart information for Desawar, Gali, Faridabad, Ghaziabad, Delhi Bazar,
          Delhi Metro, Shri Ganesh and Shiv Dham through dedicated sections available on the website.</p>

        <h3>Delhi Bazar Chart</h3>
        <p>Delhi Bazar remains one of the major market categories available on Satta King 24. Visitors
          regularly access this section while browsing other related pages.</p>
        <p>The Delhi Bazar page helps users discover additional categories through connected
          navigation links.</p>

        <h3>Delhi Metro Chart</h3>
        <p>Delhi Metro is another important section available on the website. Visitors frequently explore
          this category while browsing market pages and chart information.</p>
        <p>The page is connected with several related sections, helping users continue their browsing
          experience.</p>

        <h3>Shri Ganesh Chart</h3>
        <p>The Shri Ganesh section provides access to market information and chart-related pages.
          Visitors often access this section while exploring other categories available on Satta King 24.</p>

        <h3>Shiv Dham Chart</h3>
        <p>The Shiv Dham page remains a popular destination for users interested in browsing multiple
          market sections through a single platform.</p>

        <h2>Explore More Markets on Satta King 24</h2>
        <p>Apart from the major categories, Satta King 24 also includes several additional market
          sections that expand the website's coverage.</p>
        <p>Visitors can explore Pushkar Bazar, Makka Madina, Kalka Night, New Ganga, Gwalior,
          Fatehabad, Mathura, Alwar, Agra, Delhi Darbar, Sadar Bazar, Mandi Bazar, Dwarka, Kaliyar
          and many other categories. These pages help visitors access information from different market
          sections while remaining on one platform.</p>

        <h3>Pushkar Bazar Information</h3>
        <p>Pushkar Bazar remains an important market category and is regularly explored by visitors
          interested in discovering multiple sections available on the website.</p>

        <h3>Makka Madina Information</h3>
        <p>The Makka Madina section helps users access another popular market category through
          dedicated navigation and connected pages.</p>

        <h3>Kalka Night Information</h3>
        <p>Kalka Night continues to attract visitors who prefer browsing different market sections
          through a single platform.</p>

        <h2>Why Users Visit Satta King 24</h2>
        <p>Satta King 24 continues to attract visitors because of its organized structure and wide range
          of market categories. The platform helps users explore different sections through simple
          navigation and connected internal pages. Visitors can move between Desawar, Gali, Faridabad,
          Ghaziabad, Delhi Bazar, Delhi Metro, Shri Ganesh and Shiv Dham pages without difficulty.</p>
        <p>The website also helps users discover additional categories through related links and
          organized content sections.</p>

        <h3>Easy Navigation</h3>
        <p>The website provides a simple browsing experience that allows visitors to move between
          pages quickly.</p>

        <h3>Multiple Markets on One Platform</h3>
        <p>Users can access information from multiple market categories without visiting different
          websites.</p>

        <h3>Connected Internal Pages</h3>
        <p>Internal links help visitors discover related sections and continue exploring additional
          content.</p>

        <h3>Organized Information</h3>
        <p>Content is arranged in a structured format that improves accessibility and user experience.</p>

        <h2>About Satta King 24</h2>
        <p>Satta King 24 continues to provide access to market information, chart pages and multiple
          market categories through a single platform. The website is designed for visitors who prefer
          organized content and easy navigation.</p>
        <p>Just as people visit online platforms for education, banking, technology and services such as
          LIC, users also prefer websites that organize information clearly and make browsing easier.
          By connecting multiple market sections together, Satta King 24 helps visitors discover
          additional pages while maintaining a simple browsing experience.</p>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>

          <h3>What is Satta King 24?</h3>
          <p>Satta King 24 is a platform where visitors can explore market pages, chart records and
            information related to various market categories.</p>

          <h3>Which markets are available on Satta King 24?</h3>
          <p>Visitors can browse Desawar, Gali, Faridabad, Ghaziabad, Delhi Bazar, Delhi Metro, Shri
            Ganesh, Shiv Dham, Pushkar Bazar, Makka Madina, Kalka Night and many other market sections.</p>

          <h3>Why do users visit Satta King 24?</h3>
          <p>Users visit the website because it provides organized market information, chart pages and
            easy navigation between categories.</p>

          <h3>Can visitors access multiple market pages?</h3>
          <p>Yes. Satta King 24 includes multiple market categories connected through internal navigation
            and related pages.</p>

          <h3>Does Satta King 24 provide chart pages?</h3>
          <p>Yes. Dedicated chart sections are available for major market categories throughout the
            website.</p>
        </section>

        <h2>Conclusion</h2>
        <p>Satta King 24 brings together Desawar, Gali, Faridabad, Ghaziabad, Delhi Bazar, Delhi
          Metro, Shri Ganesh, Shiv Dham, Pushkar Bazar, Makka Madina, Kalka Night and many
          other market categories through one platform. With organized content, connected internal
          pages and dedicated chart sections, visitors can easily explore different market pages and
          access information from a single website.</p>
        <p>The platform continues to help users discover market information through simple navigation,
          structured content and a wide range of market categories available in one place.</p>
      </article>
    </>
  );
}

export default async function HomePage() {
  const [ads, contact, games] = await Promise.all([
    getAds(),
    getContact(),
    getGamesWithTodayResults()
  ]);
  const legacyAd = ads.find((ad) => ad.website === "satta-king-24") || ads[0] || {};
  const firstKhaiwal = ads.find((ad) => ad.website === "satta-king-24-1") || legacyAd;
  const secondKhaiwal = ads.find((ad) => ad.website === "satta-king-24-2") || legacyAd;
  const firstKhaiwalName = firstKhaiwal.khaiwalName || DEFAULT_KHAIWAL_NAME;
  const firstKhaiwalContact = normalizeWhatsAppNumber(firstKhaiwal.whatsappNumber || firstKhaiwal.gpayNumber || DEFAULT_CONTACT_NUMBER);
  const secondKhaiwalName = secondKhaiwal.khaiwalName || DEFAULT_KHAIWAL_NAME;
  const secondKhaiwalContact = normalizeWhatsAppNumber(secondKhaiwal.whatsappNumber || secondKhaiwal.gpayNumber || DEFAULT_CONTACT_NUMBER);
  const liveGames = orderLikeLiveSite(games);
  const [monthly, topGames] = await Promise.all([
    getMonthlyRows({ untilToday: true, games: liveGames }),
    getTopGames(liveGames)
  ]);
  const featured = pickFeatured(liveGames);
  const today = istDate();

  return (
    <PublicLayout contact={contact}>
      <main>
        <div className="max-w-screen-xl px-4 mx-auto md:px-6" style={{ padding: "15px" }}>
          <h1 className="text-lg font-bold text-center text-gray-900 uppercase">Satta King 24 – Daily Market Updates, Result Information and Chart Records</h1>
        </div>
        <Clock className="digital-clock" />
        <div className="w-full mx-auto mb-3 bg-black pb-2 overflow-hidden">
          <ResultHighlight game={topGames[0]} pending />
          <ResultHighlight game={topGames[1]} />
        </div>
        {featured.map((game) => <FeaturedResult key={game._id} game={game} />)}
        <PlayBlock 
        ad={firstKhaiwal} 
        full
        whatsapp={firstKhaiwalContact}
        name={firstKhaiwalName}
        />
        <section className="grid grid-cols-1 gap-2 bg-white lg:grid-cols-1">
          <div className="text-center text-black px-4 py-2 shadow-xl bg-yellow-50 border pt-4 mx-2 my-2 rounded-xl leading-6 font-semibold h-fit px-0 mx-0 pt-2 py-2 leading-6 border-transparent rounded-none font-normal shadow none text-lg">
            <h2>Satta King 24 Live Results | Fast & Accurate All Market Results
            </h2>
          </div>
        </section>
        <p className="py-2 text-sm font-semibold text-center text-gray-900 bg-white">FASTEST SATTA KING RESULT SITE ON INTERNET</p>
        <GameBoard games={liveGames} />
        <PlayBlock ad={secondKhaiwal} full 
        whatsapp={secondKhaiwalContact}
        name={secondKhaiwalName}
        />
        <MonthlyChartTable title={`Satta King Record Chart ${monthName(today)}`} rows={monthly.rows} columns={monthly.gameColumns} dateKey={today} chunkSize={4} />
        <SeoContent />
      </main>
    </PublicLayout>
  );
}
