"use client";

import { use, useEffect, useState } from "react";

// コンポーネント
import VideoCard from "@/components/videocard";
import PlayListCard from "@/components/playlistcard";
import Loading from "@/components/loading";

// ライブラリ
import { getChannel, getChannelWithVideos, getPlaylist } from "@/lib/getMainDatas";
import type { Channel } from "@/lib/dataTypes/channel";
import type { Playlist } from "@/lib/dataTypes/playlist";
import parseDescription from "@/components/descriptionUtils";

// css
import "@/styles/channel.css";
import "@/styles/main.css";

export default function Page({
	params
}: {
	params: Promise<{ channelId: string }>
}) {
	const { channelId } = use(params);

	const [baseChannel, setBaseChannel] = useState<Channel | null>(null);

	/* ===== 動画 ===== */
	const [channel, setChannel] = useState<Channel | null>(null);
	const [videoPrevToken, setVideoPrevToken] = useState("");
	const [videoNextToken, setVideoNextToken] = useState("");

	/* ===== 再生リスト ===== */
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [listPrevToken, setListPrevToken] = useState("");
	const [listNextToken, setListNextToken] = useState("");

	const [activeTab, setActiveTab] =
		useState<"videos" | "playlists">("videos");

	const [loading, setLoading] = useState(false);

	/* =========================
	   初期ロード
	========================= */
	useEffect(() => {
		async function init() {
			setLoading(true);

			const [ch] = await getChannel([channelId]);
			setBaseChannel(ch);

			const videoData = await getChannelWithVideos(ch);
			setChannel(videoData);
			setVideoPrevToken(videoData.prevToken);
			setVideoNextToken(videoData.nextToken);

			setLoading(false);
		}

		init();

	}, []);

	/* =========================
	   タブ切り替え時
	========================= */
	useEffect(() => {
		if (!baseChannel) return;

		if (activeTab === "videos") {
			fetchVideos();
		} else {
			fetchPlaylists();
		}
	}, [activeTab]);

	/* =========================
	   データ取得
	========================= */
	async function fetchVideos(pageToken?: string) {
		if (!baseChannel) return;

		setLoading(true);

		const data = await getChannelWithVideos(baseChannel, pageToken);
		setChannel(data);
		setVideoPrevToken(data.prevToken);
		setVideoNextToken(data.nextToken);

		setLoading(false);
	}

	async function fetchPlaylists(pageToken?: string) {
		if (!baseChannel) return;

		setLoading(true);

		const data = await getPlaylist(
			undefined,
			[baseChannel.id],
			pageToken
		);

		setPlaylists(data.lists);
		setListPrevToken(data.prevToken ?? "");
		setListNextToken(data.nextToken ?? "");

		setLoading(false);
	}

	/* =========================
	   ページ操作
	========================= */
	function nextVideoPage() {
		if (!videoNextToken || loading) return;
		fetchVideos(videoNextToken);
	}

	function prevVideoPage() {
		if (!videoPrevToken || loading) return;
		fetchVideos(videoPrevToken);
	}

	function nextListPage() {
		if (!listNextToken || loading) return;
		fetchPlaylists(listNextToken);
	}

	function prevListPage() {
		if (!listPrevToken || loading) return;
		fetchPlaylists(listPrevToken);
	}

	if (!channel) {
		return <Loading />;
	}

	return (
		<>
			{/* ===== チャンネル情報 ===== */}
			<div className="channel-detail">
				<img
					src={channel.bannerImageUrl}
					className="channel-detail-banner"
				/>

				<img
					src={channel.iconUrl}
					className="channel-detail-icon"
					alt="チャンネルアイコン"
				/>

				<h1 className="channel-detail-title">
					{channel.title}
				</h1>

				<p className="channel-detail-subscriber">
					チャンネル登録者数：
					{formatSubCount(channel.subscriberCount)}人
				</p>

				<p className="channel-detail-description">
					{channel?.description
						? parseDescription(channel.description)
						: null}
				</p>

				<p className="channel-detail-video-count">
					{channel.videoCount}本の動画
				</p>
			</div>

			{/* ===== タブ ===== */}
			<div className="channel-tabs">
				<button
					className={activeTab === "videos" ? "active" : ""}
					onClick={() => setActiveTab("videos")}
				>
					動画
				</button>
				<button
					className={activeTab === "playlists" ? "active" : ""}
					onClick={() => setActiveTab("playlists")}
				>
					再生リスト
				</button>
			</div>

			{/* ===== 動画 ===== */}
			{activeTab === "videos" && (
				<>
					<h2 className="section-title">
						{channel.title}の動画
					</h2>

					<div className="vlist">
						{channel.videos.map(v => (
							<VideoCard
								key={v.id}
								video={v}
							/>
						))}
					</div>

					<div className="page-buttons">
						<button
							onClick={prevVideoPage}
							disabled={!videoPrevToken || loading}
						>
							前のページ
						</button>
						<button
							onClick={nextVideoPage}
							disabled={!videoNextToken || loading}
						>
							次のページ
						</button>
					</div>
				</>
			)}

			{/* ===== 再生リスト ===== */}
			{activeTab === "playlists" && (
				<>
					<h2 className="section-title">
						{channel.title}の再生リスト
					</h2>

					<div className="vlist">
						{playlists.map(p => (
							<PlayListCard
								key={p.id}
								list={p}
							/>
						))}
					</div>

					<div className="page-buttons">
						<button
							onClick={prevListPage}
							disabled={!listPrevToken || loading}
						>
							前のページ
						</button>
						<button
							onClick={nextListPage}
							disabled={!listNextToken || loading}
						>
							次のページ
						</button>
					</div>
				</>
			)}
		</>
	);
}

/* =========================
   表示用ユーティリティ
========================= */
function formatSubCount(count: number) {
	if (count < 10000) return count.toString();
	if (count < 1000000) {
		return (count / 10000).toFixed(1).replace(/\.0$/, "") + "万";
	}
	return (count / 100000000).toFixed(1).replace(/\.0$/, "") + "億";
}
