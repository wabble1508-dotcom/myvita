import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
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
  title: {
    default: "MyVita",
    template: "%s · MyVita",
  },
  applicationName: "MyVita",
  description: "Eine Ansicht für alles, was im Netz zu einem Namen liegt. Profile, Videos und Seiten, sortiert.",
  appleWebApp: {
    capable: true,
    title: "MyVita",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "MyVita",
    description: "Eine Ansicht für alles, was im Netz zu einem Namen liegt.",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyVita",
    description: "Eine Ansicht für alles, was im Netz zu einem Namen liegt.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
