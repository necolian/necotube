"use client";

import { useEffect, useState } from "react";

// コンポーネント
import VideoCard from "@/components/videocard";
import Loading from "@/components/loading";

//ライブラリ
import { getPlaylist, getPlaylistItems } from "@/lib/getMainDatas";
import { Playlist } from "@/lib/dataTypes/playlist"
import { useSearchParams } from "next/navigation";
import TimeAgo from "javascript-time-ago";
import ja from "javascript-time-ago/locale/ja";

// css
import "@/styles/main.css";
import "@/styles/playlist.css";


TimeAgo.addDefaultLocale(ja);
const timeAgo = new TimeAgo("ja-JP");

interface Obj {
	[prop: string]: any
}

export default function PlayListPage() {
	const listId = useSearchParams().get("list") ?? "";

	const [playlist, setPlaylist] = useState<Playlist | null>(null);
	const [nextToken, setNextToken] = useState<string | undefined>();
	const [prevToken, setPrevToken] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);

	/* =========================
	   データ取得（共通）
	========================= */
	async function fetchPlaylist(pageToken?: string) {
		setLoading(true);

		const res = await getPlaylist([listId]);
		const base = res.lists[0];

		const result: Playlist = await getPlaylistItems(base, pageToken ?? undefined);

		console.log(base);
		setPlaylist(result);
		setNextToken(result.nextPageToken);
		console.log(nextToken)
		setPrevToken(result.prevPageToken);

		setLoading(false);
	}

	/* =========================
	   初回ロード
	========================= */
	useEffect(() => {
		fetchPlaylist();
	}, []);

	/* =========================
	   ページ操作メソッド
	========================= */
	function nextPage() {
		if (!nextToken) return;
		fetchPlaylist(nextToken);
	}

	function prevPage() {
		if (!prevToken) return;
		fetchPlaylist(prevToken);
	}

	if (!playlist) {
		return <Loading />;
	}

	return (
		<div className="playlist-layout">
			{/* ===== 左：詳細 ===== */}
			<aside className="playlist-side">
				<div className="playlist-titlebox">
					<img
						src={playlist.thumbnailUrl}
						alt="サムネ"
						className="playlist-img"
					/>
					<h2 className="playlist-title">
						{playlist.title}
					</h2>
				</div>

				<div className="playlist-meta">
					<a
						href={`/channel/${playlist.channelId}`}
						className="playlist-channel"
					>
						<img
							src={playlist.channelIconUrl}
							className="playlist-channelIcon"
						/>
						<span className="playlist-channelName">
							{playlist.channelTitle}
						</span>
					</a>

					{playlist.description && (
						<p className="playlist-description">
							{playlist.description}
						</p>
					)}

					<p className="playlist-details">
						再生リスト・{playlist.videoCount}本の動画・
						{timeAgo.format(playlist.publishedAt)}
					</p>
				</div>
			</aside>

			{/* ===== 右：動画一覧 ===== */}
			<section className="playlist-videos">
				<div className="playlist-videos-grid">
					{playlist.videos.map(video => (
						<VideoCard
							key={video.id}
							video={video}
						/>
					))}
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
			</section>
		</div>
	);
}
