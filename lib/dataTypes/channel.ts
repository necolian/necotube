import { youtube_v3 } from "googleapis";
import { Video } from "./video";

export interface Channel {
    id: string;
    title: string;
    description: string;
    iconUrl: string;
    subscriberCount: number;
    videoCount: number;
    bannerImageUrl: string;
    playlistId: string;
    nextToken: string;
    prevToken: string;
    videos: Video[]; // 動画IDの配列
}

export function APIRes2Channel(item: youtube_v3.Schema$Channel): Channel {
    return {
        id: item.id ?? "",
        title: item.snippet?.title ?? "",
        description: item.snippet?.description ?? "",
        iconUrl: item.snippet?.thumbnails?.medium?.url ?? "",
        subscriberCount: Number(item.statistics?.subscriberCount) ?? 0,
        videoCount: Number(item.statistics?.videoCount) ?? 0,
        bannerImageUrl: item.brandingSettings?.image?.bannerExternalUrl ?? "",
        playlistId: item.contentDetails?.relatedPlaylists?.uploads ?? "",
        videos: [], // 動画IDの配列はここでは取得しない, 後づけ
        nextToken: "",
        prevToken: "",
    }
}