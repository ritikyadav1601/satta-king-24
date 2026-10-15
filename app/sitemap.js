import { blogList } from "@/lib/blogData";
import { getSitemapChartData } from "@/lib/data";
import { shortMonthYear, slugify } from "@/lib/utils";

export const revalidate = 3600;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.satta-king-24.com").replace(/\/$/, "");

function entry(path, lastModified, changeFrequency = "monthly", priority = 0.6) {
  return {
    url: `${siteUrl}${path}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    changeFrequency,
    priority
  };
}

function laterDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) > new Date(b) ? a : b;
}

export default async function sitemap() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const urls = [
    entry("", now, "daily", 1),
    entry("/chart", now, "daily", 0.9),
    entry("/blogs", undefined, "weekly", 0.7),
    entry("/payment-proofs", undefined),
    entry("/disclaimer", undefined, "yearly", 0.4),
    entry("/about-us", undefined),
    entry("/privacy-policy", undefined, "yearly", 0.4),
    entry("/contact", undefined),
    entry("/faq", undefined)
  ];

  for (const post of blogList) {
    urls.push(entry(`/blogs/${post.slug}`, undefined, "monthly", 0.7));
  }

  let chartData = [];
  try {
    chartData = await getSitemapChartData();
  } catch (error) {
    console.error("sitemap: could not load chart data", error);
  }

  const monthLastMod = new Map();
  const yearLastMod = new Map();

  for (const { gameName, month, lastModified } of chartData) {
    const label = shortMonthYear(`${month}-01`);
    const isCurrent = month === currentMonth;
    const gameSlug = slugify(gameName);

    // Per-game monthly chart (same slug format as the page's canonical URL)
    urls.push(entry(`/chart/${gameSlug}-result-chart-${label}`, lastModified, isCurrent ? "daily" : "monthly", 0.7));

    monthLastMod.set(month, laterDate(monthLastMod.get(month), lastModified));

    // Year chart page only resolves when "name with dashes as spaces" matches the game name
    if (gameSlug.replace(/-/g, " ") === String(gameName).trim().toLowerCase()) {
      const key = `${gameSlug}|${month.slice(0, 4)}`;
      yearLastMod.set(key, laterDate(yearLastMod.get(key), lastModified));
    }
  }

  for (const [month, lastModified] of monthLastMod) {
    const isCurrent = month === currentMonth;
    urls.push(entry(`/chart/result-chart-${shortMonthYear(`${month}-01`)}`, lastModified, isCurrent ? "daily" : "monthly", 0.75));
  }

  for (const [key, lastModified] of yearLastMod) {
    const [gameSlug, year] = key.split("|");
    const isCurrent = year === currentMonth.slice(0, 4);
    urls.push(entry(`/year-chart/${gameSlug}-result-chart-${year}`, lastModified, isCurrent ? "daily" : "monthly", 0.7));
  }

  return urls;
}
