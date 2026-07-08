import { blogList } from "@/lib/blogData";
import { shortMonthYear } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.satta-king-24.com";
const startYear = 2022;
const marketSlugs = [
  "desawer",
  "gali",
  "ghaziabad",
  "faridabad",
  "delhi-bazar",
  "shri-ganesh",
  "shiv-dham",
  "pushkar-bazar",
  "delhi-metro",
  "shri-sayam",
  "kolmbia",
  "makka-madina",
  "kalka-night",
  "shirdi-dham",
  "sadar-bazar",
  "delhi-darbar",
  "kaliyar",
  "gwalior",
  "new-ganga",
  "delhi-matka",
  "agra",
  "fatehabad",
  "alwar",
  "shakti-peeth",
  "mandi-bazar",
  "mathura",
  "dwarka"
];

function cleanSiteUrl(path = "") {
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

function sitemapEntry(path, lastModified, changeFrequency = "monthly", priority = 0.6) {
  return {
    url: cleanSiteUrl(path),
    lastModified,
    changeFrequency,
    priority
  };
}

function monthKeys(fromYear, toDate) {
  const keys = [];
  const endYear = toDate.getFullYear();
  const endMonth = toDate.getMonth();

  for (let year = fromYear; year <= endYear; year++) {
    const monthLimit = year === endYear ? endMonth : 11;
    for (let month = 0; month <= monthLimit; month++) {
      keys.push(new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10));
    }
  }

  return keys;
}

export default function sitemap() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const months = monthKeys(startYear, now);

  const urls = [
    sitemapEntry("", now, "daily", 1),
    sitemapEntry("/chart", now, "daily", 0.9),
    sitemapEntry("/blogs", now, "weekly", 0.7),
    sitemapEntry("/payment-proofs", now),
    sitemapEntry("/disclaimer", now, "yearly", 0.4),
    sitemapEntry("/about-us", now),
    sitemapEntry("/privacy-policy", now, "yearly", 0.4),
    sitemapEntry("/contact", now),
    sitemapEntry("/faq", now)
  ];

  for (const post of blogList) {
    urls.push(sitemapEntry(`/blogs/${post.slug}`, now, "monthly", 0.7));
  }

  for (const dateKey of months) {
    const label = shortMonthYear(dateKey);
    const isCurrentMonth = dateKey.slice(0, 7) === now.toISOString().slice(0, 7);

    urls.push(sitemapEntry(`/chart/result-chart-${label}`, now, isCurrentMonth ? "daily" : "monthly", 0.75));

    for (const marketSlug of marketSlugs) {
      urls.push(sitemapEntry(`/chart/${marketSlug}-result-chart-${label}`, now, isCurrentMonth ? "daily" : "monthly", 0.7));
    }
  }

  for (let year = startYear; year <= currentYear; year++) {
    for (const marketSlug of marketSlugs) {
      urls.push(sitemapEntry(`/year-chart/${marketSlug}-result-chart-${year}`, now, year === currentYear ? "daily" : "monthly", 0.7));
    }
  }

  return urls;
}
