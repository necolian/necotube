"use client";

import { useEffect, useRef, useState, useTransition } from "react";

// コンポーネント
import VideoCard from "@/components/videocard";
import PlaylistCard from "@/components/playlistcard";
import Loading from "@/components/loading";

// ライブラリ
import { getSearch } from "@/lib/getMainDatas";
import { useSearchParams } from "next/navigation";

// css
import "@/styles/main.css"


export default function SearchResults() {
    const [datas, setDatas] = useState<any[]>([]);
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [prevToken, setPrevToken] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false)
    const loaderRef = useRef<HTMLDivElement>(null);
    const q = useSearchParams().get("q") ?? "";

    const loadMore = (pageToken?: string) => {
        setLoading(true)
        startTransition(async () => {
            const result = await getSearch(q, pageToken ?? undefined);

            setDatas(result.datas);
            setNextToken(result.nextPageToken ?? null);
            setPrevToken(result.prevpageToken ?? null);
        });
        setLoading(false)
    };

    // 初回ロード
    useEffect(() => {
        loadMore();
    }, []);

    function nextPage() {
        if (!nextToken) return;
        loadMore(nextToken);
    }

    function prevPage() {
        if (!prevToken) return;
        loadMore(prevToken);
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <h2 className="section-title">{q}の検索結果</h2>
            <div className="vlist">
                {datas.map((data) => {
                    if ("viewCount" in data) {
                        // Video
                        return <VideoCard key={data.id} video={data} />;
                    }

                    if ("subscriberCount" in data) {
                        // Channel
                        return;
                    }

                    if ("videoCount" in data) {
                        // Playlist
                        return <PlaylistCard key={data.id} list={data} />;
                    }

                })}
            </div>
            <div className="page-buttons">
                <button
                    onClick={prevPage}
                    disabled={!prevToken || loading}
                >
                    前のページ
                </button>

                <button
                    onClick={nextPage}
                    disabled={!nextToken || loading}
                >
                    次のページ
                </button>
            </div>
        </>
    );
}
