"use client";

import { useState } from "react";
import { ProjectFolder } from "./ProjectFolder";
import { PreviewModal } from "./PreviewModal";
import { RevealSection } from "@/components/shared/RevealSection";
import type { FileRequest, Project, ProjectFile } from "./types";

interface FilesClientProps {
  projects: Project[];
  files: ProjectFile[];
  fileRequests: FileRequest[];
  isStaff: boolean;
}

export function FilesClient({
  projects,
  files: initial,
  fileRequests: initialRequests,
  isStaff,
}: FilesClientProps) {
  const [files, setFiles] = useState(initial);
  const [fileRequests, setFileRequests] = useState(initialRequests);
  const [preview, setPreview] = useState<ProjectFile | null>(null);

  function handleUploaded(f: ProjectFile) {
    setFiles((prev) => [f, ...prev]);
  }

  function handleDelete(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleRequestCreated(r: FileRequest) {
    setFileRequests((prev) => [r, ...prev]);
  }

  function handleRequestFulfilled(id: string) {
    setFileRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "fulfilled" as const } : r,
      ),
    );
  }

  const noProject = files.filter((f) => !f.project_id);
  const byProject = projects.map((p) => ({
    project: p,
    files: files.filter((f) => f.project_id === p.id),
    requests: fileRequests.filter((r) => r.project_id === p.id),
  }));

  return (
    <RevealSection className="flex flex-col gap-3">
      {byProject.map(({ project, files: pf, requests }) => (
        <ProjectFolder
          key={project.id}
          project={project}
          files={pf}
          requests={requests}
          onUploaded={handleUploaded}
          onDelete={handleDelete}
          onPreview={setPreview}
          onRequestCreated={handleRequestCreated}
          onRequestFulfilled={handleRequestFulfilled}
          isStaff={isStaff}
        />
      ))}

      {isStaff && (
        <ProjectFolder
          project={null}
          files={noProject}
          requests={[]}
          onUploaded={handleUploaded}
          onDelete={handleDelete}
          onPreview={setPreview}
          onRequestCreated={handleRequestCreated}
          onRequestFulfilled={handleRequestFulfilled}
          isStaff={isStaff}
        />
      )}

      {preview && (
        <PreviewModal file={preview} onClose={() => setPreview(null)} />
      )}
    </RevealSection>
  );
}
