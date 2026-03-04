import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import PageSpinner from "./components/PageSpinner";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const DiscussionPage = lazy(() => import("./pages/DiscussionPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const OfficersPage = lazy(() => import("./pages/OfficersPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

function App() {
  return (
    <SiteLayout>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/discussion" element={<DiscussionPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/officers" element={<OfficersPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </SiteLayout>
  );
}

export default App;
