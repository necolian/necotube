import { youtube_v3 } from "googleapis";

export interface Video {
    id: string;
    publishedAt: Date;
    channelId: string;
    channelTitle: string;
    channelIconUrl: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    tags?: string[];
    viewCount: number;
    likeCount: number;
    favoriteCount: number;
    duration: string;
    commentCount?: number;
}

export function APIRes2Video(item: youtube_v3.Schema$Video): Video {
    return {
        id: item.id ?? "",
        title: item.snippet?.title ?? "",
        description: item.snippet?.description ?? "",
        publishedAt: new Date(item.snippet?.publishedAt ?? ""),
        channelId: item.snippet?.channelId ?? "",
        channelTitle: item.snippet?.channelTitle ?? "",
        channelIconUrl: "",
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? "",
        viewCount: Number(item.statistics?.viewCount ?? 0),
        likeCount: Number(item.statistics?.likeCount ?? 0),
        commentCount: Number(item.statistics?.commentCount ?? 0),
        favoriteCount: Number(item.statistics?.favoriteCount ?? 0),
        duration: isoDurationToHMS(item.contentDetails?.duration ?? "")
    };
}

function isoDurationToHMS(iso: string): string {
    if (!iso) return "";
    const match = iso.match(
        /P(?:([0-9]+)D)?T?(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?/
    );

    if (!match) return "0:00";

    const days = Number(match[1] ?? 0);
    const hours = Number(match[2] ?? 0);
    const minutes = Number(match[3] ?? 0);
    const seconds = Number(match[4] ?? 0);

    const totalHours = days * 24 + hours;

    if (totalHours > 0) {
        return `${totalHours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}