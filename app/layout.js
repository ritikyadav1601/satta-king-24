import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.satta-king-24.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Satta King 24 Fast Result Today | Live Chart & Leak Number",
  description: "Check Satta King result today fast and easy. Get Gali, Desawar, Faridabad live result, daily number update and full old chart in simple format.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gali Result | Satta king 24| Satta gali | Satta result | desawar result | satta king 24",
    description: "Check Satta King result today fast and easy. Get Gali, Desawar, Faridabad live result, daily number update and full old chart in simple format.",
    url: siteUrl,
    siteName: "Satta King 24",
    type: "website"
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Satta King 24 Fast Result Today | Live Chart & Leak Number</title>
        <meta name="google-site-verification" content="sRMc1_4zQgi8Wk2tgvLDx8zT2z28lC5w7x1F0hkGvxg" />
        <link rel="stylesheet" href="/asset/app.css" />
        <link rel="stylesheet" href="/asset/newcss.css" />
        <link rel="stylesheet" href="/asset/boostrapp.css" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="max-w-7xl mx-auto font-Roboto">{children}</body>
    </html>
  );
}
