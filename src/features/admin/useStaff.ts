import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCurrentUser } from "../profile/useCurrentUser";
import { ADMIN_ROLE_SLUG, inviteStaff, listStaff, setAdminRole, setStaffActive } from "./staffApi";
import type { StaffUser } from "./staffApi";

export function useIsAdmin(): boolean {
  const me = useCurrentUser();
  const roles = (me.data?.data?.roles ?? []) as string[];
  return useMemo(() => roles.some((role) => role.toLowerCase() === ADMIN_ROLE_SLUG), [roles]);
}

export function useStaffQuery(search: string) {
  return useQuery({
    queryFn: () => listStaff(search),
    queryKey: ["staff", search]
  });
}

export function useStaffMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["staff"] });

  return {
    invite: useMutation({ mutationFn: (input: { email: string; firstName: string; lastName: string }) => inviteStaff(input), onSuccess: invalidate }),
    setActive: useMutation({ mutationFn: (input: { user: StaffUser; active: boolean }) => setStaffActive(String(input.user.itemId), input.active), onSuccess: invalidate }),
    setAdmin: useMutation({ mutationFn: (input: { user: StaffUser; makeAdmin: boolean }) => setAdminRole(input.user, input.makeAdmin), onSuccess: invalidate })
  };
}
