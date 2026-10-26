import { CheckCircle2, Users } from "lucide-react";

export const navItems = [
  { href: "/", labelKey: "nav.tasks", icon: CheckCircle2, adminOnly: false },
  { href: "/admin", labelKey: "nav.admin", icon: Users, adminOnly: true }
] as const;
