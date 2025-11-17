import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NetObs Pro - Network Observability Platform",
  description: "Advanced network monitoring, SNMP polling, SSH config collection, and policy compliance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
