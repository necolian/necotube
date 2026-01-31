import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Suspense } from "react";
import Loading from "@/components/loading";
import Header from "@/components/header";
import { Blog } from "@/components/blog";
import { cookies } from "next/headers";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies()
  const authorized = cookieStore.get("authorized")?.value

  if (!authorized) {
    return (
      <html>
        <head>
          <link rel="icon" href="/favicon.png" />
          <title>Hazimeteno Blog</title>
        </head>
        <body>
          <Blog />
        </body>
      </html>
    )
  }

  return (
    <html lang="ja">
      <head>
        <title>necoのインスタンス</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </Header>
      </body>
    </html>
  );
}
