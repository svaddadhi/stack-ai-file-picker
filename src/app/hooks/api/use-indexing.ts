import { useState, useCallback } from "react";
import { useKnowledgeBase } from "./use-knowledge-base";
import type { FileItem } from "@/app/lib/types/file";

export function useIndexing() {
  const [pendingFiles, setPendingFiles] = useState(new Set<string>());
  const { createKnowledgeBase, syncKnowledgeBase } = useKnowledgeBase();

  const indexFiles = useCallback(
    async (connectionId: string, files: FileItem[]) => {
      const fileIds = files.map((f) => f.resource_id);
      setPendingFiles(new Set(fileIds));

      try {
        // Create a new knowledge base for these files
        const kb = await createKnowledgeBase({
          connectionId,
          connectionSourceIds: fileIds,
          name: `Indexed Files - ${new Date().toISOString()}`,
          description: "Automatically created knowledge base for indexed files",
        });

        // Trigger sync for the new knowledge base
        await syncKnowledgeBase(kb.knowledge_base_id);

        // Clear pending status
        setPendingFiles((prev) => {
          const next = new Set(prev);
          fileIds.forEach((id) => next.delete(id));
          return next;
        });

        return kb.knowledge_base_id;
      } catch (error) {
        // Clear pending status on error
        setPendingFiles((prev) => {
          const next = new Set(prev);
          fileIds.forEach((id) => next.delete(id));
          return next;
        });
        throw error;
      }
    },
    [createKnowledgeBase, syncKnowledgeBase]
  );

  return {
    indexFiles,
    isPending: (fileId: string) => pendingFiles.has(fileId),
  };
}
