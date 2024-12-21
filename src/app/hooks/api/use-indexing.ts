import { useCallback } from "react";
import { useKnowledgeBase } from "./use-knowledge-base";
import type { FileItem } from "@/app/lib/types/file";

export function useIndexing(
  kbId: string | null,
  setKbId: (val: string) => void,
  existingKBSourceIds: string[]
) {
  const {
    createKnowledgeBase,
    updateKnowledgeBase,
    syncKnowledgeBase,
    deleteResourceFromKB,
  } = useKnowledgeBase(kbId || undefined);

  const addResourcesToKB = useCallback(
    async (connectionId: string, fileIds: string[]) => {
      if (!kbId) {
        // CREATE a new KB
        const newKB = await createKnowledgeBase({
          connectionId,
          connectionSourceIds: fileIds,
          name: "My Hybrid KB",
        });
        const newId = newKB.knowledge_base_id;
        setKbId(newId);
        return newId;
      } else {
        // PATCH existing KB
        const merged = Array.from(
          new Set([...existingKBSourceIds, ...fileIds])
        );
        await updateKnowledgeBase(kbId, merged);
        return kbId;
      }
    },
    [
      kbId,
      setKbId,
      existingKBSourceIds,
      createKnowledgeBase,
      updateKnowledgeBase,
    ]
  );

  const indexFiles = useCallback(
    async (connectionId: string, files: FileItem[]) => {
      const fileIds = files.map((f) => f.resource_id);
      const finalKbId = await addResourcesToKB(connectionId, fileIds);
      await syncKnowledgeBase(finalKbId);
    },
    [addResourcesToKB, syncKnowledgeBase]
  );

  const deindexFiles = useCallback(
    async (file: FileItem) => {
      if (!kbId) return;

      try {
        await deleteResourceFromKB(kbId, file.inode_path.path);
        await syncKnowledgeBase(kbId);
      } catch (err) {
        console.error("Failed to deindex file:", err);
        throw err;
      }
    },
    [kbId, deleteResourceFromKB, syncKnowledgeBase]
  );

  return { indexFiles, deindexFiles };
}
