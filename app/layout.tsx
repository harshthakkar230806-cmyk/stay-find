import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import "../globals.css";

export const metadata = {
  title: "StayFinder — Find your stay. Within your budget.",
  description: "Discover beautiful stays across India, matched to your budget.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}