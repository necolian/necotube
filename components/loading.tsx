import styles from "./loading.module.css";
import localFont from "next/font/local";

const SmartFontUI = localFont({ src: "../font/SmartFontUI.otf" });

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={`${styles.loadingText} ${SmartFontUI.className}`}>読み込み中…</p>
    </div>
  );
}
