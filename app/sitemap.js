const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.satta-king-24.com";

export default function sitemap() {
  const now = new Date();
  return [
    "",
    "/chart",
    "/payment-proofs",
    "/disclaimer",
    "/about-us",
    "/blogs",
    "/privacy-policy",
    "/contact",
    "/faq"
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/chart" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/chart" ? 0.9 : 0.6
  }));
}
