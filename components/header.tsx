"use client";

import "./header.css";
import localFont from "next/font/local";
import { useEffect, useState } from "react";

const SmartFontUI = localFont({ src: "../font/SmartFontUI.otf" });

export default function Header({
  children,
}: {
  children: React.ReactNode;
}) {
  const [input, setInput] = useState("");
  const [suggests, setSuggests] = useState<string[]>([]);

  useEffect(() => {
    if (!input) {
      setSuggests([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(input)}`);
      const json: any = await res.json();

      // サジェスト文字列は 2番目にある配列の各要素 0 番目
      const list: string[] = json[1].map((item: any) => item[0]);

      setSuggests(list);
    }, 200);

    return () => clearTimeout(timeout);
  }, [input]);

  return (
    <>
      <header className="header">
        <div className={`header-logo ${SmartFontUI.className}`}><a className="header-logo-link" href="/">necotube</a></div>

        <form className="header-search" action="/search" method="GET" onSubmit={() => setSuggests([])}>
          <input
            type="text"
            name="q"
            placeholder="検索"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="header-searchInput" />

          {suggests.length > 0 && (
            <ul className="header-suggest">
              {suggests.map((s, i) => (
                <li
                  key={i}
                  className="header-suggest-item"
                  onClick={() => {
                    window.location.href = `/search?q=${encodeURIComponent(s)}`;
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </form>
      </header>
      <main>{children}</main>
    </>
  );
}
