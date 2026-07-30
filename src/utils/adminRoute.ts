export type AdminSection = "home" | "users" | "campaign";

export function parseAdminRoute(pathname: string): {
  active: boolean;
  section: AdminSection;
} {
  if (pathname === "/admin") {
    return { active: true, section: "home" };
  }
  if (pathname === "/admin/usuarios" || pathname.startsWith("/admin/usuarios/")) {
    return { active: true, section: "users" };
  }
  if (pathname === "/admin/campana" || pathname.startsWith("/admin/campana/")) {
    return { active: true, section: "campaign" };
  }
  return { active: false, section: "home" };
}
