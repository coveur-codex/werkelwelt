import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Werkelwelt",
  description: "Eine Werkstatt für sichere Rechenwege",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
