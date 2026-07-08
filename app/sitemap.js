import { blogList } from "@/lib/blogData";
import { getMonthlyRows } from "@/lib/data";
import { shortMonthYear, slugify } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.satta-king-24.com";
const startYear = 2022;

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

function isRealResult(value) {
  const result = String(value || "").trim().toUpperCase();
  return result !== "" && result !== "-" && result !== "XX";
}

function columnHasData(rows = [], column = "") {
  return rows.some((row) => isRealResult(row[column]));
}

function displayNameFromColumn(column = "") {
  return column.replaceAll("_", " ").trim();
}

export default async function sitemap() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const months = monthKeys(startYear, now);
  const marketSlugs = new Set();

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
    const year = Number(dateKey.slice(0, 4));
    const month = Number(dateKey.slice(5, 7));
    const monthly = await getMonthlyRows({ year, month, untilToday: false });
    const label = shortMonthYear(dateKey);
    const isCurrentMonth = dateKey.slice(0, 7) === now.toISOString().slice(0, 7);
    const columnsWithData = monthly.gameColumns.filter((column) => columnHasData(monthly.rows, column));

    if (columnsWithData.length) {
      urls.push(sitemapEntry(`/chart/result-chart-${label}`, now, isCurrentMonth ? "daily" : "monthly", 0.75));
    }

    for (const column of columnsWithData) {
      const marketSlug = slugify(displayNameFromColumn(column));
      if (!marketSlug) continue;
      marketSlugs.add(marketSlug);
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
