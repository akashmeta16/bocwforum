import { Link } from "react-router-dom";

function SiteHeader() {
  return (
    <div className="container-fluid topbar d-none d-lg-block">
      <div className="container-fluid">
        <div className="row topbar-inner align-items-center">
          <div className="col-md-4 mt-3 text-start topbar-logos">
            <img src="/assets/BOCW/lion.png" alt="Lion Emblem" decoding="async" />
            <img src="/assets/BOCW/mygov.jpg" alt="MyGov" decoding="async" />
            <img src="/assets/BOCW/mygovsym.png" alt="MyGov Symbol" decoding="async" />
          </div>
          <div className="col-md-7 mt-4 text-center">
            <h1 className="topbar-title">All India BOCW Forum</h1>
          </div>
          <div className="col-md-1 mt-4 text-center">
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteHeader;
