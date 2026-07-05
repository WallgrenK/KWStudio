import { ProjectAssetsBrowser } from "~/components/assets/ProjectAssetsBrowser";

type ProjectAssetsPanelProps = {
  projectId: string;
};

export function ProjectAssetsPanel({ projectId }: ProjectAssetsPanelProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Project assets</h2>
        <p className="mt-1 text-sm text-gray-500">Upload, organize and manage client files for this project.</p>
      </div>
      <ProjectAssetsBrowser projectId={projectId} mode="admin" />
    </section>
  );
}
