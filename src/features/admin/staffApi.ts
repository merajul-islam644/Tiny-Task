import { blocksClient } from "../../lib/blocks/client";
import type { BlocksUser } from "@seliseblocks/client";

// Staff account administration, backed by Blocks IAM. A signed-in admin
// uses these; the app's Admin role carries the "Manage Users" / "View Users"
// permissions these calls need. A user without them gets a 403 the screen
// surfaces rather than swallowing.
export type StaffUser = BlocksUser & { status?: number; active?: boolean };

export const ADMIN_ROLE_SLUG = "admin";

export async function listStaff(search?: string): Promise<StaffUser[]> {
  const response = await blocksClient.iam.users.list({ pageNo: 1, pageSize: 200, search: search || undefined });
  return (response.data ?? []) as StaffUser[];
}

export async function inviteStaff(input: { email: string; firstName: string; lastName: string }): Promise<void> {
  await blocksClient.iam.users.create({
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    roles: []
  });
}

export async function setStaffActive(userId: string, active: boolean): Promise<void> {
  if (active) {
    await blocksClient.iam.users.activate({ userId });
  } else {
    await blocksClient.iam.users.deactivate({ userId });
  }
}

export async function setAdminRole(user: StaffUser, makeAdmin: boolean): Promise<void> {
  const userId = String(user.itemId);
  const current = (user.roles ?? []).map(String);
  const nextRoles = makeAdmin
    ? Array.from(new Set([...current, ADMIN_ROLE_SLUG]))
    : current.filter((role) => role !== ADMIN_ROLE_SLUG);
  await blocksClient.iam.users.updateAccess({ roles: nextRoles, userId });
}

export function isAdminRole(roles?: string[]): boolean {
  return Boolean(roles?.some((role) => role.toLowerCase() === ADMIN_ROLE_SLUG));
}

export function isActive(user: StaffUser): boolean {
  if (typeof user.active === "boolean") return user.active;
  // IAM uses status 1 for an enabled account and 0 for a deactivated one.
  if (typeof user.status === "number") return user.status === 1;
  return true;
}
