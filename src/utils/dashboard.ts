export function dashboardBasePath(demoMode: boolean): string {
  return demoMode ? "/demo/tablero" : "/tablero";
}

export function parseDashboardRoute(
  path: string,
  demoMode: boolean,
): { active: boolean } {
  const base = dashboardBasePath(demoMode);
  return { active: path === base };
}
