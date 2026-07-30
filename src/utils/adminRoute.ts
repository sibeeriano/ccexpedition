export function parseAdminRoute(pathname: string): {
  active: boolean;
  section: "home" | "users";
} {
  if (pathname === "/admin") {
    return { active: true, section: "home" };
  }
  if (pathname === "/admin/usuarios" || pathname.startsWith("/admin/usuarios/")) {
    return { active: true, section: "users" };
  }
  return { active: false, section: "home" };
}
