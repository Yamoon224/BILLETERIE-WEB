"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconUsers } from "@kaara/shared/components/ui/icons";
import { AgentList } from "@/features/admin/AgentList";

export default function AdminAgentsPage() {
  return (
    <>
      <PageHeader icon={<IconUsers className="h-5 w-5" />} title="Agents guichet" description="Comptes agents, toutes gares confondues." />
      <AgentList />
    </>
  );
}
