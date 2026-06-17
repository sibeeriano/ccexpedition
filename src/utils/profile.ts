export function profileBasePath(demoMode: boolean): string {
  return demoMode ? "/demo/perfil" : "/perfil";
}

export function parseProfileRoute(
  path: string,
  demoMode: boolean,
): { active: boolean } {
  const base = profileBasePath(demoMode);
  return { active: path === base };
}
