import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marija i Petar",
  description: "Slike s naše svadbe",
  openGraph: {
    title: "Marija i Petar",
    description: "Slike s naše svadbe",
    type: "website",
    siteName: "Marija i Petar",
    images: [
      {
        url: "https://res.cloudinary.com/dnmrg6knf/image/upload/c_fit,w_1200,q_auto,f_auto/153_bvqltp",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
