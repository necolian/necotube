import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";

  const url = `http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&alt=json&q=${encodeURIComponent(q)}`;

  const res = await fetch(url);
  const text = await res.text();
  
  // JSON 部分を切り出す
  const startIndex = text.indexOf('[');
  const endIndex = text.lastIndexOf(']') + 1;
  const json = JSON.parse(text.slice(startIndex, endIndex));
  
  return NextResponse.json(json);
}
