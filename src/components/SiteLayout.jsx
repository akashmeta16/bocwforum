import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import SiteNav from "./SiteNav";

function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

export default SiteLayout;
