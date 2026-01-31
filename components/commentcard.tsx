"use client"

import { Comment } from "@/lib/dataTypes/comment"
import "./commentcard.css"

interface CommentCardProps {
    comment: Comment
    replies?: Comment[]
}

export function CommentCard({ comment, replies }: CommentCardProps) {
    return (
        <div className="comment-card">
            {/* 投稿者情報 */}
            <a href={`/channel/${comment.channelId}`}>
                <div className="comment-header">
                    <img
                        src={comment.channelIconUrl}
                        alt={comment.channelTitle}
                        className="comment-avatar"
                    />
                    <div className="comment-meta">
                        <span className="comment-author">{comment.channelTitle}</span>
                        {/* 投稿時間があればここに書く */}
                    </div>
                </div>
            </a>

            {/* コメント本文 */}
            <p className="comment-content">{comment.content}</p>

            {/* 返信（あれば） */}
            {replies && replies.length > 0 && (
                <div className="comment-replies">
                    {replies.map((r) => (
                        <div key={r.id} className="comment-reply">
                            <CommentCard comment={r} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
