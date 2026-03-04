import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/discussion", label: "Discussion" },
  { to: "/resources", label: "Resources" },
  { to: "/officers", label: "Officers" },
  { to: "/gallery", label: "Gallery" }
];

function SiteNav() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  return (
    <div className="container-fluid main-navbar">
      <nav className="navbar navbar-expand-lg p-0">
        <div className="container-fluid">
          <button
            className="navbar-toggler my-1"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`}>
            <div className="navbar-nav mx-lg-auto">
              <span className="nav-filler" />
              <span className="nav-filler" />
              <span className="nav-filler" />
              <span className="nav-filler" />
              <span className="nav-filler" />
              <span className="nav-filler" />
              <span className="nav-filler" />
              <span className="nav-filler" />
              <span className="nav-filler" />
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default SiteNav;
