"use server"

import { google } from "googleapis";
import { APIRes2Video, Video } from "./dataTypes/video";
import { APIRes2Channel, Channel } from "./dataTypes/channel";
import { searchData, searchResponse } from "./dataTypes/searchData";
import { Playlist, APIRes2Playlist, Playlists } from "./dataTypes/playlist";
import "@/styles/main.css";
import { videoLink } from "./dataTypes/videoLink";
import { Comment } from "@/lib/dataTypes/comment"

interface Obj {
    [prop: string]: any
}

const API_KEY = process.env.YOUTUBE_DATA_API_KEY;
if (!API_KEY) {
    console.error("環境変数 YOUTUBE_DATA_API_KEY が設定されていません");
    process.exit(1);
}

const youtube = google.youtube({ version: "v3", auth: API_KEY });

export async function getVideoData(id?: String[], popular?: Boolean): Promise<Video[]> {
    try {
        let params: Obj = {
            part: ["id", "snippet", "statistics", "contentDetails"],
        }
        if (id) params.id = id.join(",");
        if (popular) {
            params.chart = "mostPopular";
            params.regionCode = "JP";
            params.maxResults = 50;
        };

        const res = await youtube.videos.list(params);
        const items = res.data.items ?? [];
        const data: Video[] = items.map(APIRes2Video);
        const channelIcons = await getChannelIcon(data.map(v => v.channelId));
        data.forEach((v, index) => v.channelIconUrl = channelIcons[index]);
        return data;
    } catch (e) {
        throw new Error(`動画データの取得に失敗しました:${e}`);
    }
}

export async function getChannel(channelIds: string[]): Promise<Channel[]> {
    try {
        // 🔹 重複削除（順番は維持）
        const uniqueIds = Array.from(new Set(channelIds));

        const res = await youtube.channels.list({
            id: uniqueIds,
            part: ["snippet", "brandingSettings", "contentDetails", "statistics"],
        });

        const items = res.data.items ?? [];
        const channels = items.map(APIRes2Channel);

        // 🔹 元のID順に並び替え（APIは順番保証しないため）
        const channelMap = new Map(channels.map(c => [c.id, c]));

        return channelIds
            .map(id => channelMap.get(id))
            .filter((c): c is Channel => c !== undefined);
    } catch (e) {
        throw new Error(`チャンネルデータの取得に失敗しました:${e}`);
    }
}

export async function getChannelWithVideos(channel: Channel, pageToken?: string): Promise<Channel> {
    try {
        const list = await getPlaylist([channel.playlistId]);
        const listItem = await getPlaylistItems(list.lists[0]);
        const videoIds = listItem.videos.map(v => v.id);
        const videos = await getVideoData(videoIds);
        const data: Channel = {
            ...channel,
            videos: videos,
            nextToken: listItem.nextPageToken,
            prevToken: listItem.prevPageToken,
        }
        return data;
    } catch (e) {
        throw new Error(`チャンネルと動画データの取得に失敗しました:${e}`);
    }
}

export async function getChannelIcon(id: string[]): Promise<string[]> {
    try {
        const res = await getChannel([...id]);
        if (res.length === 0) return [];
        return res.map(data => data.iconUrl);
    } catch (e) {
        throw new Error(`チャンネルアイコンの取得に失敗しました:${e}`);
    }
}

export async function getSearch(
    query?: string,
    pageToken?: string,
): Promise<searchData> {
    try {
        let params: Obj = {
            q: query,
            part: ["id"],
            maxResults: 50,
        }
        if (pageToken) params.pageToken = pageToken;

        const res = await youtube.search.list(params);
        const items = res.data.items ?? [];

        // -- それぞれのデータを変換する作業 -- //
        // 番号を振る
        let datas: Obj = [];
        items.map((item, index) => {
            const data: searchResponse = {
                number: index,
                kind: item.id?.kind ?? "",
                data: item
            }
            datas.push(data);
        });

        // 型振り分け
        let videos: Obj = [];
        let channels: Obj = [];
        let playlists: Obj = [];
        datas.map((data: searchResponse) => {
            if (data.kind.includes("video")) {
                videos.push(data)
            } else if (data.kind.includes("channel")) {
                channels.push(data)
            } else if (data.kind.includes("playlist")) {
                playlists.push(data)
            }
        });

        // それぞれ取得
        let videoDatas: Video[] = [];
        let channelDatas: Channel[] = [];
        let playlistDatas: Playlist[] = [];
        if (videos.length > 0) videoDatas = await getVideoData(videos.map((v: searchResponse) => v.data.id.videoId));
        if (channels.length > 0) channelDatas = await getChannel(channels.map((v: searchResponse) => v.data.id.channelId));
        if (playlists.length > 0) playlistDatas = (await getPlaylist(playlists.map((v: searchResponse) => v.data.id.playlistId))).lists;

        // 番号をもどす
        let gotVideos = videoDatas.map((v, index) => {
            const video: searchResponse = {
                number: videos[index].number,
                kind: "youtube#video",
                data: v,
            }
            return video;
        });
        let gotChannels = channelDatas.map((v, index) => {
            const video: searchResponse = {
                number: channels[index].number,
                kind: "youtube#channel",
                data: v,
            }
            return video;
        });
        let gotPlaylists = playlistDatas.map((v, index) => {
            const video: searchResponse = {
                number: playlists[index].number,
                kind: "youtube#playlist",
                data: v,
            }
            return video;
        });

        const gotDatas: searchResponse[] = gotVideos.concat(gotChannels).concat(gotPlaylists);

        const sortedDatas = [...gotDatas].sort((a, b) => a.number - b.number);
        const resultDatas = sortedDatas.map(data => data.data);

        // -- 変換作業終了 -- //

        const data: searchData = {
            query: query ?? "",
            datas: resultDatas,
            nextPageToken: res.data.nextPageToken ?? "",
            prevpageToken: res.data.prevPageToken ?? "",
        }
        return data;
    } catch (e) {
        throw new Error(`検索データの取得に失敗しました:${e}`);
    }
}

export async function getPlaylist(id?: string[], channelId?: string[], pageToken?: string): Promise<Playlists> {
    try {

        let params: Obj = {
            part: ["snippet", "contentDetails"],
            maxResults: 50,
        }
        if (id) params.id = id.join(",");
        if (channelId) params.channelId = channelId.join(",");
        if (!id && !channelId) throw new Error("プレイリストIDまたはチャンネルIDのいずれかを指定してください");
        if (pageToken) params.pageToken = pageToken;

        const res = await youtube.playlists.list(params);
        const items = res.data.items ?? [];
        const data: Playlist[] = items.map(APIRes2Playlist);
        const channelIds = data.map(list => list.channelId);
        const channelIcons = await getChannelIcon(channelIds);
        data.forEach((list, index) => {
            list.channelIconUrl = channelIcons[index];
        });
        const result: Playlists = {
            lists: data,
            nextToken: res.data.nextPageToken ?? "",
            prevToken: res.data.prevPageToken ?? "",
        }
        return result;
    } catch (e) {
        throw new Error(`プレイリストデータの取得に失敗しました:${e}`);
    }
}

export async function getPlaylistItems(list: Playlist, pageToken?: string): Promise<Playlist> {
    try {
        let params: Obj = {
            playlistId: list.id,
            part: ["contentDetails"],
            maxResults: 50,
        }
        if (pageToken) params.pageToken = pageToken;

        const res = await youtube.playlistItems.list(params);
        const items = res.data.items ?? [];

        list.videoCount = items.length;
        const videoIds = items.map(item => item.contentDetails?.videoId);
        const videos = await getVideoData(videoIds as string[]);
        const result: Playlist = {
            ...list,
            videos,
            nextPageToken: res.data?.nextPageToken ?? "",
            prevPageToken: res.data?.prevPageToken ?? "",
        };

        return result;

    } catch (e) {
        throw new Error(`プレイリスト内動画データの取得に失敗しました:${e}`);
    }
}

export async function getVideoLink(id: string): Promise<videoLink[]> {
    const res = await fetch(`http://tube.necohub.net/video/${id}`);

    if (!res.ok) {
        throw new Error(`動画情報取得に失敗 (${res.status})`);
    }

    const data = await res.json();
    const formats = Array.isArray(data.formats) ? data.formats : [];
    let urls: videoLink[] = [];

    for (const f of formats) {
        const link: videoLink = {
            url: f.url,
            height: f.height,
        }
        urls.push(link);
    }

    return urls;

}

export async function getComments(videoId: string): Promise<Comment[]> {
    try {
        const res = await youtube.commentThreads.list({
            part: ["snippet", "replies"],
            videoId: videoId,
            maxResults: 50,
            textFormat: "plainText", // テキストをプレーンにする
        })

        // API レスポンス本体（YouTube Data API の構造）
        const items = res.data.items || []

        // パース結果格納用
        const parsed: Comment[] = []

        // 1 件ずつ処理
        for (const item of items) {
            const top = item.snippet?.topLevelComment
            if (top && top.snippet) {
                // トップレベルコメントを追加
                parsed.push({
                    id: top.id || "",
                    content: top.snippet.textDisplay || "",
                    channelTitle: top.snippet.authorDisplayName || "",
                    channelIconUrl: top.snippet.authorProfileImageUrl || "",
                    channelId: top.snippet.authorChannelId?.value || "",
                    replies: [], // 返信は後で入れる
                })
            }

            // 返信があれば replies.comments 配列に入る
            const replies = item.replies?.comments || []
            for (const rep of replies) {
                if (rep.snippet) {
                    parsed.push({
                        id: rep.id || "",
                        content: rep.snippet.textDisplay || "",
                        channelTitle: rep.snippet.authorDisplayName || "",
                        channelIconUrl: rep.snippet.authorProfileImageUrl || "",
                        channelId: rep.snippet.authorChannelId?.value || "",
                        replies: [], // このサンプルでは返信のさらに返信は無視（APIは全部返さないことがある）
                    })
                }
            }
        }

        return parsed
    } catch (e) {
        console.error(`コメントを取得できませんでした: ${e}`)
        return []
    }
}

// data api の割当て高すぎ問題
// export async function getTranscript(videoId: string): Promise<>{
    
// }

// 後回し
// export async function getRelatedVideos(video: Video): Promise<Video[]> {
//     try {
//         const title = video.title ?? "";

//         // 2) 検索クエリを生成
//         const baseQuery = getRandomSubstring(title);
//         console.log(baseQuery);

//         // 3) 検索して動画一覧を取得
//         const searchRes = await getSearch(baseQuery);

//         let data: Video[] = []
//         searchRes.datas.map(v => {
//             if (v.viewCount) data.push(v);
//         })
//         return searchRes.datas;

//     } catch (e) {
//         throw new Error(`関連動画取得に失敗しました: ${e}`);
//     }

//     function getRandomSubstring(title: string): string {
//         // 文字列長
//         const n = title.length;
//         if (n <= 1) return title;

//         // ランダムな開始位置 (0 ～ n-1)
//         const start = Math.floor(Math.random() * n);

//         // ランダムな終了位置 (start+1 ～ n)
//         const end = Math.floor(Math.random() * (n - start)) + start + 1;

//         // 部分文字列を返す
//         return title.substring(start, end);
//     }
// }
