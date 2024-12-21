import { useCallback } from "react";
import { useKnowledgeBase } from "./use-knowledge-base";
import type { FileItem } from "@/app/lib/types/file";

export function useIndexing(
  kbId: string | null,
  setKbId: (val: string) => void,
  existingKBSourceIds: string[] // see explanation below
) {
  const { createKnowledgeBase, updateKnowledgeBase, syncKnowledgeBase } =
    useKnowledgeBase(kbId || undefined);

  // If we don't have a KB yet, create one. If we have one, patch it.
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
        // store the kbId in state
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

  // Index: adds items to the KB, then triggers a sync
  const indexFiles = useCallback(
    async (connectionId: string, files: FileItem[]) => {
      const fileIds = files.map((f) => f.resource_id);
      const finalKbId = await addResourcesToKB(connectionId, fileIds);
      await syncKnowledgeBase(finalKbId);
    },
    [addResourcesToKB, syncKnowledgeBase]
  );

  const deindexFiles = useCallback(
    async (fileIds: string[]) => {
      if (!kbId) return;

      console.warn(
        "[useIndexing] Deindex not fully implemented in the 'hybrid' approach."
      );

      await syncKnowledgeBase(kbId);
    },
    [kbId, syncKnowledgeBase]
  );

  return { indexFiles, deindexFiles };
}
