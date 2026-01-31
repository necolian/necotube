import { youtube_v3 } from "googleapis";
import { Video } from "./video";

export interface Playlist {
    id: string;
    title: string;
    nextPageToken: string;
    prevPageToken: string;
    videoCount: number;
    thumbnailUrl: string;
    channelId: string;
    channelTitle: string;
    channelIconUrl: string;
    publishedAt: Date;
    description: string;
    videos: Video[];
}

export interface Playlists {
    lists: Playlist[];
    nextToken: string;
    prevToken: string;
}

export function APIRes2Playlist(item: youtube_v3.Schema$Playlist) : Playlist {
    return {
        id: item.id ?? "",
        title: item.snippet?.title ?? "",
        nextPageToken: "",
        prevPageToken: "",
        videoCount: item.contentDetails?.itemCount ?? 0,
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? "",
        channelId: item.snippet?.channelId ?? "",
        channelTitle: item.snippet?.channelTitle ?? "",
        channelIconUrl: "",
        publishedAt: new Date(String(item.snippet?.publishedAt)) ?? null,
        description: item.snippet?.description ?? "",
        videos: [],
    };
}
