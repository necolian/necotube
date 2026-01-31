"use client"

import { useState } from "react"
import parseDescription from "./descriptionUtils"

import "./expandableDescription.css"

export function ExpandableDescription({ text }: { text: string }) {
    const LIMIT = 200  // 最初に表示する文字数
    const [expanded, setExpanded] = useState(false)

    const isLong = text.length > LIMIT
    const displayText = expanded ? text : text.slice(0, LIMIT) + (isLong ? "..." : "")

    return (
        <div className="expandable-description">
            <div className="watch-description">
                {parseDescription(displayText)}
            </div>

            {isLong && (
                <button
                    className="description-toggle"
                    onClick={() => setExpanded((prev) => !prev)}
                >
                    {expanded ? "閉じる" : "もっと見る"}
                </button>
            )}
        </div>
    )
}
