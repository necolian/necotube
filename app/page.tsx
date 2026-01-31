
import { Metadata } from "next";

// コンポーネント
import VideoCard from "@/components/videocard";

// ライブラリ
import { getVideoData } from "@/lib/getMainDatas";
import { Video } from "@/lib/dataTypes/video";

// css
import "@/styles/main.css";

export default async function Home() {

  const videos: Video[] = await getVideoData(undefined, true);

  // 空配列 or エラー時のハンドリング
  if (!videos || videos.length === 0) {
    throw new Error("動画データの取得に失敗しました");
  }

  return (
    <>
      <h2 className={`section-title`}>おすすめ動画</h2>
      <div className="vlist">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video} />
        ))}
      </div>
    </>
  );
}