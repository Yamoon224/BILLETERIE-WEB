"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconChat } from "@kaara/shared/components/ui/icons";
import { SmsBoxPanel } from "@/features/admin/SmsBoxPanel";

export default function AdminSmsPage() {
  return (
    <>
      <PageHeader icon={<IconChat className="h-5 w-5" />} title="SMS Box" description="Supervision des SIM et de la file d'envoi des billets." />
      <SmsBoxPanel />
    </>
  );
}
