import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "MyVita",
    template: "%s · MyVita",
  },
  applicationName: "MyVita",
  description: "Deine Vita, alles an einem Ort: Lebenslauf, Portfolio und alle Kanäle. Finde andere über Name oder MyVita-ID.",
  appleWebApp: {
    capable: true,
    title: "MyVita",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "MyVita",
    description: "Deine Vita. Alles an einem Ort.",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyVita",
    description: "Deine Vita. Alles an einem Ort.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
