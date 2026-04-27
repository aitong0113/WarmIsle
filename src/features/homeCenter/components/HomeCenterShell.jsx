import { Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";

import { HOME_CENTER_PAGES } from "../config/homeCenterPages";

function HomeCenterShell({ pageId, kicker, title, description, children }) {
  return (
    <section className="home-center">
      <div className="home-center__hero">
        <div>
          <Link to="/island" className="home-center__back-link">
            <BsArrowLeft aria-hidden="true" />
            <span>回到首頁地圖</span>
          </Link>
          <p className="home-center__eyebrow">{kicker}</p>
          <h1>{title}</h1>
          <p className="home-center__description">{description}</p>
        </div>
      </div>

      <nav className="home-center__nav" aria-label="首頁功能導覽">
        {HOME_CENTER_PAGES.map((page) => {
          const Icon = page.icon;
          const isActive = page.id === pageId;

          return (
            <Link
              key={page.id}
              to={page.path}
              className={`home-center__nav-link${isActive ? " is-active" : ""}`}
            >
              <Icon aria-hidden="true" />
              <span>{page.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="home-center__content">
        {children}
      </div>
    </section>
  );
}

export default HomeCenterShell;