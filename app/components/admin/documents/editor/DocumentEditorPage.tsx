import { DocumentEditorCanvas } from "./DocumentEditorCanvas";
import { DocumentEditorLeftSidebar } from "./DocumentEditorLeftSidebar";
import { DocumentEditorRightSidebar } from "./DocumentEditorRightSidebar";
import { DocumentEditorToolbar } from "./DocumentEditorToolbar";

export function DocumentEditorPageShell() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <DocumentEditorToolbar />
      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <DocumentEditorLeftSidebar />
        <main className="min-h-0 overflow-y-auto bg-[#f8fafc]">
          <DocumentEditorCanvas />
        </main>
        <DocumentEditorRightSidebar />
      </div>
    </div>
  );
}
