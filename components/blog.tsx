"use client"

import "./blog.css"
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Head from "next/head";

export function Blog() {

    useEffect(() => {
        document.title = "Hazimeteno Blog - Home";
    }, []);

    const handleClick = () => {
        // 有効期限を 7日後にする例
        const expire = new Date()
        expire.setDate(expire.getDate() + 7)

        document.cookie = `authorized=true; expires=${expire.toUTCString()}; path=/`
    }

    return (
        <>
            <header>
                <h1>Hazimeteno Blog</h1>
                <nav>
                    <ul>
                        <li><a href="#">ホーム</a></li>
                        <li><a href="#">記事一覧</a></li>
                        <li><a href="#">カテゴリ</a></li>
                        <li><a href="#">お問い合わせ</a></li>
                        <button onClick={() => {
                            handleClick();
                            location.reload();
                        }}>ここを押してください</button>
                    </ul>
                </nav>
            </header>

            <main>
                <section className="hero">
                    <h2>最新のブログ記事</h2>
                </section>

                <section className="posts">
                    <article className="post">
                        <h3><a href="#">最新SEO対策まとめ：2026年に効果的なブログ改善ポイント</a></h3>
                        <p className="meta">2024-02-03 | Webマーケティング</p>
                        <p className="excerpt">検索順位を上げるための必須SEOテクニックをわかりやすく解説します。初心者にも実践しやすい内容です。</p>
                    </article>

                    <article className="post">
                        <h3><a href="#">2026年最新ガジェット比較：コスパ最強スマホTOP5</a></h3>
                        <p className="meta">2024-01-30 | テクノロジー、ガジェット</p>
                        <p className="excerpt">最新スマホの性能・価格・カメラ機能を比較し、コスパ重視のおすすめ機種をランキング形式で紹介します。</p>
                    </article>

                    {/* 追加記事もここに */}
                </section>
            </main>

            <footer>
                <p>&copy; 2026 Hazimeteno Blog</p>
            </footer>
        </>
    )
}