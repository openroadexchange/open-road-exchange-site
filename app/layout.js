export const metadata = {
  title: "Open Road Exchange",
  description: "RVs, Trucks, and Trailers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
