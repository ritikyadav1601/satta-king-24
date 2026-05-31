import Link from "next/link";
import MonthlyChartTable from "@/components/MonthlyChartTable";
import PublicLayout from "@/components/PublicLayout";
import { getGamesWithTodayResults, getMonthlyRows, getTopGames } from "@/lib/data";
import { DEFAULT_CONTACT_NUMBER, DEFAULT_KHAIWAL_NAME } from "@/lib/contactDefaults";
import { formatTime, istDate, monthName } from "@/lib/utils";

export const revalidate = 30;

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
        <h2>Satta King 24: Satta King Live Result, Chart &amp; Game Updates 2026</h2>
        <p>Welcome to Satta King 24! If you are searching the internet for the most accurate and quickest Satta King Result, you have landed on the perfect platform. Every single day, millions of online users eagerly wait for the declaration of lucky numbers from various prominent markets. Isliye, hamari website aapko sabse tez Fast Satta Result pradan karne ke liye hamesha taiyar rehti hai. Our primary objective is to deliver real-time data to our visitors without any technical delays. Hamara main maqsad yeh hai ki aapko bina kisi deri ke Today Satta Result mil sake, taaki aapko kisi dusri fraud website par bhatakna na pade. We continuously monitor the market trends of Satta King 2026 to ensure our records remain flawless and highly reliable for everyone.</p>

        <h2>Why Satta King 24 is the Ultimate Destination for Superfast Satta Result</h2>
        <p>The internet is flooded with numerous platforms claiming to provide the quickest speculative updates. However, when the actual announcement time arrives, most of these generic servers experience severe downtime or lag. Lekin Satta King 24 par aapko aisi koi dikkat nahi aayegi. Hamara platform ekdam satta super fast tarike se kaam karta hai. The moment an official number is declared by the respective market operators, our backend system immediately pushes it live onto your screen.</p>
        <p>Experienced players understand how crucial every single second is when tracking daily numbers. Therefore, we have meticulously optimized our website infrastructure to serve you better. This advanced technical refinement ensures you receive your superfast satta result smoothly, completely free of any loading issues or unnecessary buffering. Furthermore, our interface is entirely mobile-responsive to cater to on-the-go users. Iska matlab yeh hai ki aap apne smartphone par bhi bina kisi pareshani ke charts aur live numbers ko dekh sakte hain.</p>

        <h2>Analyzing Volatility with Satta King Chart 2026</h2>
        <p>In the world of speculative number games, historical data and old records play an incredibly vital role. A vast majority of analytical players systematically examine previous months and years of data to formulate their calculations and understand underlying number frequencies. Recognizing this essential user requirement, we have beautifully structured the Satta King Chart 2026 into a clean, highly organized, and easily accessible format.</p>
        <p>Is chart ki madad se aap pichle kuch dino, hafton ya mahino ke results ko aapas mein compare kar sakte hain. Studying historical records helps users comprehend market volatility and shifting trends effectively. While this game relies entirely on individual luck and mathematical randomness, a well-maintained record dashboard keeps you ahead of the curve. Our dedicated team updates these statistics daily with absolute precision, taaki aapko hamesha accurate aur genuine numbers hi dekhne ko milein.</p>

        <h2>Real-Time Updates for Major Markets in One Place</h2>
        <p>Our platform eliminates the tedious need to browse multiple web pages for different regional markets. We comprehensively cover all major national markets directly on a single, consolidated dashboard. Below is the detailed operational breakdown of the primary game markets whose schedules and real-time announcements are managed seamlessly on our homepage:</p>

        <h2>Desawer Result &amp; Gali Result Timings</h2>
        <p>In the entire domain, Desawer and Gali are considered the oldest and most widely followed game markets. The anticipation surrounding their daily numbers is exceptionally high among enthusiasts. Hamari website par aapko Desawer Result subah ke samay aur Gali Result der raat ko sabse pehle dekhne ko mil jata hai. If you prefer tracking their combined performance, our specialized satta king gali disawar section offers dedicated tables housing complete past records for both these legendary markets.</p>

        <h2>Faridabad Result &amp; Ghaziabad Result Updates</h2>
        <p>Faridabad and Ghaziabad have emerged as highly popular evening and night markets over recent years. They operate on a strict, pre-determined schedule. The moment the official clock hits the declaration time, our live sources sync up to broadcast the Faridabad Result and Ghaziabad Result instantly. Agar aap internet par specialized data jaise satta king faridabad faridabad search kar rahe hain, toh aapko batadein ki is market ki har choti-badi update aapko yahan bina kisi delay ke sabse pehle milne wali hai.</p>

        <h2>Satta King Live Result Check Karne Ka Sahi Tarika</h2>
        <p>Bohot se naye users ko website par aane ke baad sahi table dhoondne mein thodi pareshani hoti hai. Isliye hamari website ka layout behad simple aur user-friendly banaya gaya hai taaki koi bhi ise aasani se samajh sake. To check the latest Satta King Live Result flawlessly, simply follow these straightforward steps:</p>
        <ul>
          <li>Step 1: Open your preferred internet browser and type the correct URL: satta-king-24.com.</li>
          <li>Step 2: Homepage khulte hi aapko sabse upar 'Live Result Update' ka ek section dikhai dega.</li>
          <li>Step 3: Look closely at the display dashboard where each market name is highlighted alongside its respective opening time and the newly declared lucky number.</li>
          <li>Step 4: Agar aapko purana record dekhna hai, toh aap thoda niche scroll karke Satta King Chart 2026 ke monthly tables ko check kar sakte hain.</li>
        </ul>
        <p>By sticking to this effortless method, you can easily find your desired details within a matter of seconds while saving your valuable time.</p>

        <h2>Responsible Information &amp; Safety Policy Note</h2>
        <p>We are firmly committed to delivering transparent information while fully respecting search engine policies and international digital guidelines. It is crucial to remember that speculative number games are completely unpredictable, and there is no scientific formula or hidden trick to guarantee a specific outcome. Therefore, we strictly advise users to stay cautious and avoid falling for fraudulent claims regarding fixed 'leak numbers' or insider tips circulating online.</p>
        <p>Our website functions strictly as an informational dashboard and historical archive platform showcasing publicly available data. Hum kisi bhi tarah ke betting ya illegal gambling ko badhava nahi dete hain. We highly prioritize creating a safe, informative, and clean digital environment for all our online visitors globally.</p>
      </article>
      <section className="faq-section">
        <h2>Frequently Asked Questions - Satta King 24</h2>
        <div className="faq-item"><h3>Q1. What is the update speed on Satta King 24?</h3><p>Our servers operate at a satta super fast speed. Jaise hi official market se number declare hota hai, uske theek ek minute ke andar aapko yahan live result dekhne ko mil jata hai.</p></div>
        <div className="faq-item"><h3>Q2. Where can I find the historical trends for Satta King 2026?</h3><p>The comprehensive Satta King Chart 2026 available on our homepage is the most accurate repository. Isme Desawer, Gali, Faridabad aur Ghaziabad ke sabhi purane records saaf-saaf darshaye gaye hain jinhe dekhna bohot aasan hai.</p></div>
        <div className="faq-item"><h3>Q3. What are the standard timings for the satta king gali disawar markets?</h3><p>Generally, the Desawer Result is announced early in the morning around 05:05 AM, whereas the Gali Result is pushed live late at night at 11:50 PM. Hamari site dono samay active rehti hai.</p></div>
        <div className="faq-item"><h3>Q4. Does the homepage display evening records for Faridabad and Ghaziabad?</h3><p>Yes, absolutely. You can access the live Faridabad Result at 05:55 PM and the Ghaziabad Result at 09:00 PM daily. Hum satta king faridabad faridabad market ke har ek updown par gehri najar rakhte hain.</p></div>
        <div className="faq-item"><h3>Q5. Can someone accurately predict the Today Satta Result?</h3><p>No, it is mathematically impossible because it relies on a completely random number generation system. Halanki log purane charts aur patterns ko dekh kar andaza lagate hain, lekin kisi bhi number ki 100% guarantee nahi hoti, isliye satark rahein.</p></div>
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
          <h1 className="text-lg font-bold text-center text-gray-900 uppercase">Welcome to Satta King 24 | Fast Live Result Chart 2026</h1>
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
