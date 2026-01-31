import Link from "next/link"

// YouTube URL の判定関数（簡易版）
function isYouTubeUrl(url: string) {
    try {
        const parsed = new URL(url)
        return (
            parsed.hostname.includes("youtube.com") ||
            parsed.hostname.includes("youtu.be")
        )
    } catch {
        return false
    }
}

// 説明文を JSX に変換
export default function parseDescription(text: string) {
    const parts = text.split(/(https?:\/\/[^\s]+)/g)

    return parts.map((part, i) => {
        if (part.match(/^https?:\/\//)) {
            if (isYouTubeUrl(part)) {
                // YouTube のリンクなら内部ルーティング用に
                const url = new URL(part)
                const videoId = url.searchParams.get("v")
                if (videoId) {
                    return (
                        <Link key={i} href={`/watch?v=${encodeURIComponent(videoId)}`}>
                            {part}
                        </Link>
                    )
                }
            }
            // external なリンクは普通の a タグ
            return (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer">
                    {part}
                </a>
            )
        }
        return <span key={i}>{part}</span>
    })
}

