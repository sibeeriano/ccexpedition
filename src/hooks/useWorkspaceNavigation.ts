import { useAppPath } from "./useAppPath";
import { dashboardBasePath, parseDashboardRoute } from "../utils/dashboard";
import { newsBasePath, parseNewsRoute } from "../utils/news";

export function useWorkspaceNavigation(demoMode: boolean) {
  const { path, navigate } = useAppPath();
  const newsBase = newsBasePath(demoMode);
  const dashboardRoute = parseDashboardRoute(path, demoMode);
  const newsRoute = parseNewsRoute(path, demoMode);
  const workspacePath = demoMode ? "/demo" : "/";

  function openNewsList() {
    navigate(newsBase);
  }

  function openNewsPost(slug: string) {
    navigate(slug ? `${newsBase}/${slug}` : newsBase);
  }

  function openDashboard() {
    navigate(dashboardBasePath(demoMode));
  }

  function backToWorkspace() {
    navigate(workspacePath);
  }

  return {
    isNewsView: newsRoute.active,
    isDashboardView: dashboardRoute.active,
    newsSlug: newsRoute.slug,
    openNewsList,
    openNewsPost,
    openDashboard,
    backToWorkspace,
  };
}
