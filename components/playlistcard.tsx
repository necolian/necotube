import { Playlist } from "@/lib/dataTypes/playlist";
import "./videocard.css";
import "./playlistcard.css";
import TimeAgo from "javascript-time-ago";
import ja from "javascript-time-ago/locale/ja";

TimeAgo.addDefaultLocale(ja);
const timeAgo = new TimeAgo("ja-JP");

export default function PlayListCard({
    list
}: {
    list: Playlist
}) {

    return (
        <div className="videocard">
            <a href={`/playlist?list=${list.id}`} className="videocard-thumb">
                <img className="videocard-img" src={list.thumbnailUrl} />
                <span className="videocard-duration">
                    {list.videoCount}本の動画
                </span>
            </a>
            <div className="videocard-info">
                <h5 className="playlistcard-title">プレイリスト</h5>
                <h3 className="videocard-title"><a href={`/playlist?list=${list.id}`}>{list.title}</a></h3>
                <div className="videocard-details">
                    <a href={`/channel/${list.channelId}`}>
                        <div className="videocard-channel">
                            <img className="videocard-channel-icon" src={list.channelIconUrl} />
                            <p className="videocard-channel-name">{list.channelTitle}</p>
                        </div>
                    </a>
                    <div className="videocard-details">
                        <p className="videocard-meta">{timeAgo.format(new Date(list.publishedAt))}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}