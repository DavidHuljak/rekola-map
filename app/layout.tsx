import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pamětníci na rekolech",
  description: "Mapa a seznam pamětníků projektu Pamětníci na rekolech",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
