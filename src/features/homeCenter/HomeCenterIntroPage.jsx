import { Link } from "react-router-dom";
import { BsArrowUpRight } from "react-icons/bs";

import HomeCenterShell from "./components/HomeCenterShell";
import { getHomeCenterPage } from "./config/homeCenterPages";

function HomeCenterIntroPage() {
  const page = getHomeCenterPage("intro");

  return (
    <HomeCenterShell
      pageId={page.id}
      kicker={page.kicker}
      title={page.title}
      description="如果你想重新走一遍進島前的對話，或回到最初那個陪你進島的入口，可以從這裡回去。"
    >
      <article className="home-center-card">
        <p className="home-center-card__lead">
          有時候回到起點，不是重來，而是重新確認自己現在需要什麼。
        </p>
        <div className="home-center-card__actions">
          <Link to="/intro" className="home-center-card__primary-link">
            前往入口
            <BsArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </article>
    </HomeCenterShell>
  );
}

export default HomeCenterIntroPage;