import "@/styles/err404.css";

export default function NotFound() {
    return (
        <div className="err404-container">
            <h1 className="err404-title">404</h1>
            <p className="err404-text">ページが見つかりませんでした</p>
            <a className="err404-btn" href="/">ホームへ戻る</a>
        </div>
    );
}