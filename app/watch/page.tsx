"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

// コンポーネント
import VideoPlayer from "@/components/videoplayer"
import Loading from "@/components/loading"
import { CommentCard } from "@/components/commentcard"
import { ExpandableDescription } from "@/components/expandableDescription"
// import VideoCard from "@/components/videocard"

// ライブラリ
import { getComments, /* getRelatedVideos,*/ getVideoData, getVideoLink } from "@/lib/getMainDatas"
import { videoLink } from "@/lib/dataTypes/videoLink"
import { Video } from "@/lib/dataTypes/video"
import { Comment } from "@/lib/dataTypes/comment"

// css
import "@/styles/main.css"
import "@/styles/watch.css"

export default function WatchPage() {
    const v = useSearchParams().get("v")
    const [videos, setVideos] = useState<videoLink[]>([])
    const [videoDetails, setVideoDetails] = useState<Video>()
    const [loading, setLoading] = useState(true)
    const [comments, setComments] = useState<Comment[]>()
    // const [related, setRelated] = useState<Video[]>()

    if (!v) throw new Error("videoIdが設定されていません")

    useEffect(() => {
        async function fetchVideo() {
            setLoading(true)

            try {
                // 並列に実行したい Promise をまとめる
                const [
                    rawLinks,
                    videodata,
                    commentData,
                ] = await Promise.all([
                    getVideoLink(v as string),
                    getVideoData([v as string]),
                    getComments(v as string),
                ])

                const selected = selectNonM3u8(rawLinks)
                const video = videodata[0]

                // 関連動画も並列で取りたい場合
                // const relatedVideos = await getRelatedVideos(video)

                setComments(commentData)
                setVideoDetails(video)
                setVideos(selected)
                // setRelated(relatedVideos)

            } catch (e) {
                console.error(e)
                // エラー処理
            } finally {
                setLoading(false)
            }
        }

        fetchVideo()
    }, [v])


    if (loading || videos.length === 0) {
        return <Loading />
    }

    return (
        <>
            <div className="watch">
                <div className="watch-player">
                    {!loading && videos && (
                        <VideoPlayer
                            videos={videos}
                            posterUrl={videoDetails?.thumbnailUrl} />
                    )}
                </div>
                <div className="watch-videodetails">
                    <h1 className="watch-title">{videoDetails?.title}</h1>
                    <div className="watch-channel">
                        <a className="watch-channel-link" href={`/channel/${videoDetails?.channelId}`}>
                            <img src={videoDetails?.channelIconUrl} className="watch-channel-icon" />
                            <h3 className="watch-channel-title">{videoDetails?.channelTitle}</h3>
                        </a>
                    </div>
                    <div className="watch-description"><ExpandableDescription text={videoDetails?.description ?? ""} /></div>
                </div>
                <div className="watch-comments">
                    <h1 className="watch-comments-title">コメント: {videoDetails?.commentCount}件</h1>
                    {comments?.map((c) => (
                        <CommentCard
                            key={c.id}
                            comment={c}
                            replies={c.replies}
                        />
                    ))}
                </div>
            </div>
            {/* <div className="watch-related">
                {related?.map((v) => (
                    <VideoCard
                        key={v.id}
                        video={v} />
                ))}
            </div> */}
        </>
    )
}

function selectNonM3u8(links: videoLink[]) {
    const filtered = links.filter(l => !l.url.toLowerCase().includes(".m3u8"))

    const map = new Map<number, videoLink[]>()

    for (const link of filtered) {
        if (!map.has(link.height)) {
            map.set(link.height, [])
        }
        map.get(link.height)!.push(link)
    }

    const result: videoLink[] = []

    for (const [height, arr] of map) {
        // 同じ height が複数あってもとりあえず最初のやつだけ選ぶ
        result.push(arr[0])
    }

    // 高画質順
    return result.sort((a, b) => b.height - a.height)
}
