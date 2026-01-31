"use client"

import { useRef, useEffect, useState } from "react"
import videojs from "video.js"
import "video.js/dist/video-js.css"

import "videojs-yt-style/dist/videojs-yt-style.css"
import "videojs-yt-style"
import "videojs-hotkeys"

import "./videoplayer.css"
import { videoLink } from "@/lib/dataTypes/videoLink"

interface VideoPlayerProps {
    videos: videoLink[]
    posterUrl?: string
}

export default function VideoPlayer({ videos, posterUrl }: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)

    // state for current quality
    const [currentQuality, setCurrentQuality] = useState(videos[0].height)

    // state for subtitle track
    const [subtitleTrack, setSubtitleTrack] = useState<string | null>(null)

    useEffect(() => {
        if (!containerRef.current || playerRef.current) return

        const videoEl = document.createElement("video")
        videoEl.className = "video-js vjs-yt"

        if (posterUrl) videoEl.setAttribute("poster", posterUrl)

        containerRef.current.appendChild(videoEl)

        const player = videojs(videoEl, {
            controls: true,
            preload: "auto",
            fluid: true,
            sources: [
                {
                    src: videos.find(v => v.height === currentQuality)?.url,
                    type: "video/mp4"
                }
            ]
        })

        // hotkeys
        if (typeof (player as any).hotkeys === "function") {
            (player as any).hotkeys()
        }
        // youtube 風 style
        if (typeof (player as any).ytStyle === "function") {
            (player as any).ytStyle()
        }

        playerRef.current = player

        return () => {
            player.dispose()
            playerRef.current = null
        }
    }, [videos, posterUrl])

    // 画質切替処理
    function changeQuality(height: number) {
        if (!playerRef.current) return
        const next = videos.find(v => v.height === height)
        if (!next) return

        const currentTime = playerRef.current.currentTime()
        playerRef.current.src({
            src: next.url,
            type: "video/mp4"
        })
        playerRef.current.currentTime(currentTime)
        playerRef.current.play()
        setCurrentQuality(height)
    }

    // 字幕切替処理
    function toggleSubtitle(trackLang: string | null) {
        if (!playerRef.current) return
        const tracks = playerRef.current.textTracks()
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = tracks[i].language === trackLang ? "showing" : "disabled"
        }
        setSubtitleTrack(trackLang)
    }

    return (
        <div className="player-main">
            <div className="player-video-main" ref={containerRef}></div>

            <div className="player-settings">
                {/* 外側画質選択 */}
                {videos.length > 1 && (
                    <div className="player-external-quality-selector">
                        <p>画質:</p>
                        <select
                            value={currentQuality}
                            onChange={(e) => changeQuality(Number(e.target.value))}
                            className="player-external-quality-select"
                        >
                            {videos.map((v) => (
                                <option key={v.height} value={v.height}>
                                    {v.height}p
                                </option>
                            ))}
                        </select>
                    </div>
                )}


                {/* 外側字幕選択 */}
                <div className="player-external-subtitle-selector">
                    {playerRef.current?.textTracks?.().length ? (
                        <>
                            <p>字幕:</p>
                            <select
                                value={subtitleTrack ?? ""}
                                onChange={(e) => toggleSubtitle(e.target.value || null)}
                                className="player-external-subtitle-select"
                            >
                                {/* OFF を選択肢として追加 */}
                                <option value="">字幕OFF</option>

                                {/* TextTrack が埋め込まれている場合は各トラックをオプション化 */}
                                {Array.from(playerRef.current.textTracks()).map((t: any) => (
                                    <option key={t.language} value={t.language}>
                                        {t.label || t.language}
                                    </option>
                                ))}
                            </select>
                        </>
                    ) : null}
                </div>

            </div>
        </div>
    )
}
