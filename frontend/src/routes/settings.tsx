import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePage } from "@/components/module-page";
// TODO(settings-api): FastAPI exposes no settings/preferences endpoint, so this screen cannot persist changes yet.
export const Route = createFileRoute("/settings")({
  component: () => (
    <ModulePage
      title="Settings"
      description="Configure contract lifecycle workspace preferences."
      icon={Settings}
    />
  ),
});
