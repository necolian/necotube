
export interface Comment {
    id: string;               // 一意識別用
    content: string;
    channelTitle: string;
    channelIconUrl: string;
    channelId: string;
    replies?: Comment[];      // 子コメント（任意）
}
