import { useCallback } from "react";
import { useKnowledgeBase } from "./use-knowledge-base";
import type { FileItem } from "@/app/lib/types/file";

export function useIndexing(
  kbId: string | null,
  setKbId: (val: string) => void,
  existingKBSourceIds: string[]
) {
  const { createKnowledgeBase, deleteResourceFromKB, syncKnowledgeBase } =
    useKnowledgeBase(kbId || undefined);

  const indexFiles = useCallback(
    async (connectionId: string, files: FileItem[]) => {
      const fileIds = files.map((f) => f.resource_id);

      if (!kbId) {
        // Create new KB
        const newKB = await createKnowledgeBase({
          connectionId,
          connectionSourceIds: fileIds,
          name: "My Hybrid KB",
        });
        const newId = newKB.knowledge_base_id;
        setKbId(newId);
        await syncKnowledgeBase(newId);
      } else {
        // Create a new KB with merged source IDs
        const allIds = Array.from(
          new Set([...existingKBSourceIds, ...fileIds])
        );
        await createKnowledgeBase({
          connectionId,
          connectionSourceIds: allIds,
          name: "My Hybrid KB",
        });
        await syncKnowledgeBase(kbId);
      }
    },
    [kbId, createKnowledgeBase, existingKBSourceIds, setKbId, syncKnowledgeBase]
  );

  const deindexFiles = useCallback(
    async (file: FileItem) => {
      if (!kbId || !file.connection_id) return;

      try {
        // Delete the file from KB
        await deleteResourceFromKB(kbId, file.inode_path.path);

        // Remove the deindexed file ID from existingKBSourceIds
        const updatedSourceIds = existingKBSourceIds.filter(
          (id) => id !== file.resource_id
        );

        // Create a new KB with the updated source IDs
        // This ensures we don't have lingering state from previous KBs
        if (updatedSourceIds.length > 0) {
          await createKnowledgeBase({
            connectionId: file.connection_id,
            connectionSourceIds: updatedSourceIds,
            name: "My Hybrid KB",
          });
        }

        await syncKnowledgeBase(kbId);
      } catch (err) {
        console.error("Failed to deindex file:", err);
        throw err;
      }
    },
    [
      kbId,
      deleteResourceFromKB,
      syncKnowledgeBase,
      createKnowledgeBase,
      existingKBSourceIds,
    ]
  );

  return { indexFiles, deindexFiles };
}
