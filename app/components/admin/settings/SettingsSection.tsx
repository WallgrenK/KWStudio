import type { ReactNode } from "react";
import { FormCard } from "~/components/admin/FormCard";

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <FormCard title={title} description={description}>
      {children}
    </FormCard>
  );
}
