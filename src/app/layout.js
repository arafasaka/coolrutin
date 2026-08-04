import "./globals.css";

export const metadata = {
  title: "coolrutin",
  description: "Mood tracker & daily journal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}