import Link from "next/link";
import Clock from "@/components/Clock";
import MonthlyChartTable from "@/components/MonthlyChartTable";
import PublicLayout from "@/components/PublicLayout";
import { getAds, getContact, getGamesWithTodayResults, getMonthlyRows, getTopGames } from "@/lib/data";
import { DEFAULT_CONTACT_NUMBER, DEFAULT_KHAIWAL_NAME, normalizeWhatsAppNumber } from "@/lib/contactDefaults";
import { formatTime, istDate, monthName } from "@/lib/utils";

export const revalidate = 1;

export const metadata = {
  title: "Satta King 24 | Fast Satta King Result Today | Live Chart 2026",
  description: "Satta King 24 par paye sabse tez Satta King Result. Gali, Desawer, Faridabad aur Ghaziabad ke live result aur satta king chart 2026 ki puri jankari yahan dekhein."
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

function PlayBlock({ ad, full = false }) {
  const name = ad?.khaiwalName || DEFAULT_KHAIWAL_NAME;
  const pay = ad?.gpayNumber || DEFAULT_CONTACT_NUMBER;
  const whatsapp = normalizeWhatsAppNumber(ad?.whatsappNumber || DEFAULT_CONTACT_NUMBER);

  return (
    <div id="kha" className="card-body sk24-khaiwal-card">
      {full ? (
        <div className="sk24-khaiwal-copy">
          <p>बिंदास गेम प्ले कर सकते हो आप बिना किसी टेंशन के</p>
          <p className="sk24-khaiwal-name">♕♕ RAHUL BHAI ♕♕</p>
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
            PAYTM//BANK TRANSFER//PHONE PAY//GOOGLE PAY =&gt;9588518047
          </p>
          <p className="sk24-khaiwal-separator">
            =====================================<br />
            👉 9588518047👈<br />
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
      <a href={`https://wa.me/919588518047`} className="Wbutton">
        <img loading="lazy" width="100%" src="/asset/whatsapp.png" alt="Whatsapp to Play Game" />
      </a>
    </div>
  );
}

function SeoContent() {
  return (
    <>
      <article className="blog-post">
        <p>Welcome to Satta-King-24.com, the most trusted, secure, and lightning-fast digital portal for everything related to the vast Satta King universe. If you are searching for the most accurate Satta king result updates, historical data sheets, and comprehensive game analysis, you have reached the ultimate online destination. In the fast-paced world of online satta, having access to instant information is absolute power. We ensure that our visitors get that power before anyone else. Our platform is specifically engineered to provide a satta result live update within seconds of the official number declaration.</p>
        <p>For years, enthusiasts and local analysts have relied on manual record-keeping, broken links, and slow-loading blogs. In 2026, we completely redefine that experience by introducing the best online satta website interface. Whether you are closely tracking the shifting numbers of the black satta king market or looking for the latest community updates on the legendary A7 satta game, we cover every major, minor, and regional market with surgical precision. Our mission is to provide a clean, highly reliable, and super-fast environment for users to monitor their favorite speculative games without any hassle.</p>

        <h2>What is Satta King and How to Play Online Satta?</h2>
        <p>The term Satta King has become a legendary household name across various regions, representing a massive network of local lotteries and number-based speculative markets. Originally, this game started decades ago as a physical lottery system relying on large earthen pots and handwritten slips of paper. However, with the digital revolution taking over, the landscape has completely transformed into an online satta ecosystem. Today, players from all walks of life monitor daily satta market numbers to test their luck, study mathematical probabilities, and evaluate historical data.</p>
        <p>The core mechanics of the game are incredibly simple, which explains its massive widespread appeal. Participants select any two-digit number ranging from 00 to 99. A single winning combination is drawn randomly at a predetermined time specific to that local market. If your selected number matches the officially declared number, you are crowned the winner. While the name sounds like a single unified game, it is actually a massive umbrella term for a collection of independent local markets such as Gali, Disawar, Faridabad, and Ghaziabad. Each of these markets operates on its own unique schedule, releasing its independent satta king result daily. On our website, we consolidate all these scattered results into one beautifully organized dashboard, making us the premier destination for satta live game updates.</p>

        <h3>The Rise of Black Satta King and A7 Satta Platforms</h3>
        <p>As public interest spiked over the years, the market witnessed the emergence of distinct variations and specialized sub-markets. Among them, black satta king became a highly prominent search term for players looking for highly specific, fast-paced localized draws that offer quick turnaround times. Similarly, the A7 satta platform emerged as a niche but intensely followed segment of the speculative gaming market, drawing thousands of daily active analytical minds.</p>
        <p>Unlike basic blogs that only focus on one or two main draws, our website takes pride in ensuring a comprehensive approach. We don't just focus on the massive mainstream games; we continuously track and provide deep data for every reputable sub-market. This ensures that our users get a complete 360-degree historical view of the entire industry on a single page, eliminating the need to browse multiple sketchy websites.</p>

        <h3>How Satta Market Numbers are Calculated and Released</h3>
        <p>The process of drawing the winning combination relies on independent local systems. Each market—be it Gali, Disawar, or Faridabad—has its own management panel. At the designated hour, a random draw produces a two-digit number, determining the daily satta market numbers.</p>
        <p>Once the number is declared, local agents verify the results and broadcast them. Our platform acts as a direct bridge, picking up these raw declarations instantly and rendering them in a clean, readable format for millions of users who want a satta king fast result today.</p>

        <h2>Exploring the Major Satta King Markets</h2>
        <p>While there are dozens of smaller local draws, the market is overwhelmingly dominated by four legendary games. Understanding these pillars is crucial for anyone analyzing the daily Gali Disawar satta record chart.</p>

        <h3>1. Disawar Satta King</h3>
        <p>Disawar is indisputably the oldest and most influential game in the entire industry. The unique defining feature of Disawar is its timing. It opens its cards in the early hours of the morning. For many followers, checking the Disawar morning Satta king result is the very first ritual of their day.</p>

        <h3>2. Gali Satta</h3>
        <p>If Disawar rules the morning, Gali dominates the night. Gali is famous for its massive volume of participants. The result is typically announced late at night. Because it acts as the final major draw of the calendar day, the Gali record heavily influences market sentiment and upcoming satta live game updates for the next morning.</p>

        <h3>3. Faridabad Satta King</h3>
        <p>Faridabad serves as the perfect afternoon bridge for the community. Its draw takes place in the late afternoon, making it highly popular. The Faridabad market has shown immense stability over the years, with highly consistent chart patterns that attract seasoned analysts who love studying statistical variations.</p>

        <h3>4. Ghaziabad Satta</h3>
        <p>Operating in the early evening hours, Ghaziabad acts as the gateway to the night sessions. The historical records for Ghaziabad are frequently cross-referenced with Faridabad to analyze shifting trends and find the next winning satta king jodi number.</p>

        <h2>Satta King 2026 Live Result Dashboard</h2>
        <p>Our live dashboard is designed with a mobile-first philosophy. We understand that a vast majority of our visitors access this website using smartphones, often on mobile networks where page loading speeds can fluctuate. Therefore, our live dashboard is built using ultra-lightweight code, ensuring the satta king fast result today loads completely within milliseconds.</p>
        <blockquote>Live Update Section: This is the exact place on our homepage where our interactive, automated live table displays real-time numbers for Gali, Disawar, Faridabad, Ghaziabad, and Taj. Simply refresh your browser page to sync with our servers instantly.</blockquote>
        <p>By bookmarking Satta-King-24.com, you protect yourself from old data and misleading announcements. You ensure that you are always the first person in your circle to know the official winning satta market numbers. Our clean, mobile-responsive layout adapts beautifully to your smartphone screens, allowing you to check live numbers seamlessly even on fluctuating mobile networks.</p>

        <h2>The Ultimate Satta King Chart Guide: How to Read Satta Records</h2>
        <p>A common mistake made by newcomers is viewing these daily numbers as completely isolated incidents. Seasoned experts, however, know that the true secret to understanding the market lies within the historical Satta king chart. A comprehensive satta record chart 2026 is a beautifully structured matrix that organizes past results by day, week, month, and year. Studying a comprehensive record helps individuals move away from blind guessing and transition into calculated data evaluation.</p>

        <h3>Why the Gali Disawar Satta Record Chart Matters</h3>
        <p>In the vast landscape of speculative gaming, Gali and Disawar are universally acknowledged as the two most powerful and prestigious markets. The Gali Disawar satta record chart is monitored, audited, and cross-referenced by millions of people every single day. Disawar typically declares its results in the early hours of the morning, setting the tone for the day, while Gali opens its cards late at night, bringing a dramatic close to the daily session. By observing how numbers move between these two giant columns over weeks and months on our satta king chart, sharp minds can spot repeating sequences, number skips, and zero-frequency periods.</p>

        <h3>Step-by-Step Instructions to Read Our Satta King Chart</h3>
        <p>Navigating and understanding our data sheets is incredibly simple and user-friendly. We have removed clutter to give you an optimal viewing experience:<br />
          Choose the Time Period: Use our clean navigation menus to access the specific month or the complete satta record chart 2026 database.<br />
          Identify the Market Column: Each major game has its own dedicated vertical column on the primary satta king chart page.<br />
          Locate the Calendar Date: Scroll down the rows vertically to align with the exact date you wish to inspect.<br />
          Analyze Neighboring Cells: Look closely at the numbers immediately above, below, and diagonal to your target cell to track shifting numerical trends.</p>

        <h2>How to Find the Winning Satta King Jodi Number</h2>
        <p>Every enthusiast dreams of tracking down that elusive, perfect satta king jodi number. In the terminology of local gaming, a 'Jodi' means a pair of numbers or a complete two-digit result. While every number from 00 to 99 has an mathematically equal chance of being drawn, experts look at previous day results to calculate the "Haruf" (single digits).</p>
        <p>The two-digit result is divided into two parts: the Ander Haruf (the internal or tens digit) and the Bahar Haruf (the external or ones digit). By tracking recent entries on the satta king chart, analysts try to forecast whether the upcoming number will feature an odd or even Haruf. Combining these calculated single digits helps narrow down the choices to form a strategic satta king jodi number, shifting the approach from random luck to statistical tracking.</p>

        <h3>Avoiding the Satta King Leak Jodi Scam</h3>
        <p>We feel it is our absolute responsibility to protect our community from bad actors. If you browse social media groups or messaging apps, you will find hundreds of scammers claiming to sell official satta king leak jodi numbers in exchange for advance fees. Please understand that this is completely fake. The draws are randomized, and no one has pre-determined access to them. Anyone claiming otherwise is running a fraud scheme to steal your money. We strictly advise our users to completely ignore these fake promises. Instead of losing money to scams, rely on your own study of the official Gali Disawar satta record chart and track live trends transparently using our free satta live game updates.</p>

        <section className="faq-section">
          <h2>Frequently Asked Questions (FAQ) About Online Satta</h2>

          <h3>What is the primary difference between Satta King and Satta Matka?</h3>
          <p>Historically, Satta Matka originated first, involving placing wagers on the opening and closing rates of cotton transmitted from the New York Cotton Exchange. On the other hand, Satta King evolved later as a highly modernized, localized digital lottery system named after specific prominent markets like Gali, Disawar, and Faridabad.</p>

          <h3>How can I make sure I am viewing the most recent Satta king result?</h3>
          <p>To ensure you are tracking real-time updates, simply bookmark our platform and refresh the homepage during draw hours. Our cloud-based server infrastructure delivers a lightning-fast satta result live update straight from the official sources, making us the most reliable destination for the daily satta king result.</p>

          <h3>Are A7 Satta and Black Satta King covered in your record books?</h3>
          <p>Yes, absolutely. While our primary focus remains on the four core mainstream games, our extensive digital database continuously monitors and archives all major regional variations. This includes dedicated columns for A7 satta and the popular black satta king files, giving you a comprehensive view of the market.</p>

          <h3>Can I look at older charts on this website?</h3>
          <p>Yes, you can easily access our deep historical archives. Our system allows users to seamlessly scroll through not just the current satta record chart 2026 but also explore data sheets from previous consecutive years to study long-term trends on the main satta king chart.</p>

          <h3>Does this website charge any fees for tips or live updates?</h3>
          <p>No, never. Satta-King-24.com is a completely free informational, educational, and statistical tracking portal. We never charge any money for our resources, we do not promote or sell any fraudulent satta king leak jodi numbers, and we do not collect wagers. All tools on our best online satta website are 100% free for public research.</p>
        </section>

        <h2>Conclusion: Why Satta-King-24.com is the Best Online Satta Website</h2>
        <p>Selecting a reliable tracking companion is the most important step for any data enthusiast. In an internet space crowded with slow blogs, broken layouts, and aggressive pop-up advertisements, Satta-King-24.com stands out as a reliable option for transparency, security, and extreme speed. We provide you with a high-performance ecosystem where you can track live entries, view comprehensive satta market numbers, and study historical record sheets in a safe environment.</p>
        <p>Stay ahead of the game, protect yourself from online frauds, and use our systematically updated satta king chart matrices to build your analytical skills. Bookmark us today, check back frequently for your satta king fast result today, and experience the highest standard of live tracking on the web. Always keep a logical mind, rely strictly on verified public charts, and let data guide your journey!</p>
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
  const primaryAd = ads[0] || {};
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
          <h1 className="text-lg font-bold text-center text-gray-900 uppercase">Satta King 2026 | Satta King Result | Live Satta King Chart</h1>
        </div>
        <Clock className="digital-clock" />
        <div className="w-full mx-auto mb-3 bg-black pb-2 overflow-hidden">
          <ResultHighlight game={topGames[1]} pending />
          <ResultHighlight game={topGames[0]} />
        </div>
        {featured.map((game) => <FeaturedResult key={game._id} game={game} />)}
        <PlayBlock ad={primaryAd} />
        <section className="grid grid-cols-1 gap-2 bg-white lg:grid-cols-1">
          <div className="text-center text-black px-4 py-2 shadow-xl bg-yellow-50 border pt-4 mx-2 my-2 rounded-xl leading-6 font-semibold h-fit px-0 mx-0 pt-2 py-2 leading-6 border-transparent rounded-none font-normal shadow none text-lg">
            <h3>To Check instant SATTA KING 24 Results, Check Below Chart 👇🏿</h3>
          </div>
        </section>
        <h3 className="py-2 text-sm font-semibold text-center text-gray-900 bg-white">FASTEST SATTA KING RESULT SITE ON INTERNET</h3>
        <GameBoard games={liveGames} />
        <PlayBlock ad={primaryAd} full />
        <MonthlyChartTable title={`Satta King Record Chart ${monthName(today)}`} rows={monthly.rows} columns={monthly.gameColumns} dateKey={today} chunkSize={4} />
        <SeoContent />
      </main>
    </PublicLayout>
  );
}
