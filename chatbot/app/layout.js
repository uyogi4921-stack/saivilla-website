import "./globals.css";

export const metadata = {
  title: "Sai Villa DreamHouse — Property Assistant",
  description:
    "Chat with Sai, the official property assistant of Sai Villa DreamHouse Pvt. Ltd. Find flats, villas, plots and commercial properties in Palanpur & Ahmedabad, and book a free site visit.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#075E54",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
