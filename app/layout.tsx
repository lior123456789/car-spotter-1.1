import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarSpotter — Snap any car. Know everything.",
  description:
    "Point your phone at any car. Our AI tells you the make, model, year, original price, current value, rarity, celebrity owners, even the engine sound. Free to start.",
  openGraph: {
    title: "CarSpotter — Snap any car. Know everything.",
    description: "AI car identifier. 500,000+ models. Engine sounds. Market value. Built on Claude.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
