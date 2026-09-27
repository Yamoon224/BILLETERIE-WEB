"use client";

import { PageHeader } from "@/components/ui";
import { IconUsers } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { UserList } from "@/features/users/UserList";

export default function UsersPage() {
  return (
    <RequirePermission permission="users.view">
      <PageHeader icon={<IconUsers className="h-5 w-5" />} title="Utilisateurs" description="Comptes, roles et rattachement aux compagnies." />
      <UserList />
    </RequirePermission>
  );
}
