export const metadata = {
  title: "EmojiWorld",
  description: "A simple app to send and receive emojis in real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}