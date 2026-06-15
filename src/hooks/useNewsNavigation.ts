import { useAppPath } from "./useAppPath";
import { newsBasePath, parseNewsRoute } from "../utils/news";

export function useNewsNavigation(demoMode: boolean) {
  const { path, navigate } = useAppPath();
  const base = newsBasePath(demoMode);
  const route = parseNewsRoute(path, demoMode);
  const workspacePath = demoMode ? "/demo" : "/";

  function openNewsList() {
    navigate(base);
  }

  function openNewsPost(slug: string) {
    navigate(slug ? `${base}/${slug}` : base);
  }

  function backToWorkspace() {
    navigate(workspacePath);
  }

  return {
    isNewsView: route.active,
    newsSlug: route.slug,
    openNewsList,
    openNewsPost,
    backToWorkspace,
  };
}
