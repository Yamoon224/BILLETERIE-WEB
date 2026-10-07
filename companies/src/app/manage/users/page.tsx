"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconUsers } from "@kaara/shared/components/ui/icons";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { UserList } from "@kaara/shared/features/users/UserList";

export default function UsersPage() {
  return (
    <RequirePermission permission="users.view">
      <PageHeader icon={<IconUsers className="h-5 w-5" />} title="Utilisateurs" description="Comptes, roles et rattachement aux compagnies." />
      <UserList />
    </RequirePermission>
  );
}
