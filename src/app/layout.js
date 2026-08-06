import "./globals.css";
import { UnsavedChangesProvider } from "@/context/unsaved-changes";

export const metadata = {
  title: "coolrutin",
  description: "Mood tracker & daily journal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UnsavedChangesProvider>{children}</UnsavedChangesProvider>
      </body>
    </html>
  );
}
