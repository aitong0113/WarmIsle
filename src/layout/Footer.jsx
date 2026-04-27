function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links" aria-label="頁尾連結">
        <button type="button" className="footer-link-btn">
          關於我們
        </button>
        <button type="button" className="footer-link-btn">
          常見問題
        </button>
        <button type="button" className="footer-link-btn">
          隱私政策
        </button>
      </div>
      <p className="footer-copy">Warm Isle · 在情緒的海上，有座懂你的島。</p>
    </footer>
  );
}

export default Footer;
