"use client";
import "@/styles/err500.css";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="err500-container">
      <h1 className="err500-title">500 - サーバーエラー</h1>
      <p className="err500-text">問題が発生しました。</p>
      <p className="err500-msg">メッセージ:
        {error.message}</p>
      <button className="err500-btn" onClick={() => reset()}>再試行</button>
    </div>
  );
}
