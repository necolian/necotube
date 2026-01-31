import "./videocard.css";
import { Video } from "@/lib/dataTypes/video";
import TimeAgo from "javascript-time-ago";
import ja from "javascript-time-ago/locale/ja";

TimeAgo.addDefaultLocale(ja);
const timeAgo = new TimeAgo("ja-JP");

export default function VideoCard({
    video
}: {
    video: Video
}) {

    return (
        <div className="videocard">
            <a href={`/watch?v=${video.id}`} className="videocard-thumb">
                <img className="videocard-img" src={video.thumbnailUrl} />
                <span className="videocard-duration">
                    {video.duration}
                </span>
            </a>
            <div className="videocard-info">
                <h3 className="videocard-title"><a href={`/watch?v=${video.id}`}>{video.title}</a></h3>
                <div className="videocard-details">
                    <a href={`/channel/${video.channelId}`}>
                        <div className="videocard-channel">
                            <img className="videocard-channel-icon" src={video.channelIconUrl} />
                            <p className="videocard-channel-name">{video.channelTitle}</p>
                        </div>
                    </a>
                    <div className="videocard-details">
                        <p className="videocard-meta">{video.viewCount} views • {timeAgo.format(new Date(video.publishedAt))}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}