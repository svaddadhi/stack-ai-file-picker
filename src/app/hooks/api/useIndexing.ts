import { useCallback } from "react";
import { useKnowledgeBase } from "./useKnowledgeBase";
import type { FileItem } from "@/app/lib/types/file";

export function useIndexing(
  kbId: string | null,
  setKbId: (val: string) => void,
  existingKBSourceIds: string[]
) {
  const {
    createKnowledgeBase,
    deleteResourceFromKB,
    syncKnowledgeBase,
    fetchKBChildren,
  } = useKnowledgeBase(kbId || undefined);

  const indexFiles = useCallback(
    async (connectionId: string, files: FileItem[]) => {
      const newIds = files.map((f) => f.resource_id);
      if (!newIds.length) return;

      try {
        if (!kbId) {
          const createdKB = await createKnowledgeBase({
            connectionId,
            connectionSourceIds: newIds,
            name: "My Hybrid KB",
          });
          const newKBId = createdKB.knowledge_base_id;
          setKbId(newKBId);
          await syncKnowledgeBase(newKBId);
        } else {
          const merged = Array.from(
            new Set([...existingKBSourceIds, ...newIds])
          );
          await createKnowledgeBase({
            connectionId,
            connectionSourceIds: merged,
            name: "My Hybrid KB",
          });
          await syncKnowledgeBase(kbId);
        }
      } catch (err) {
        console.error("[useIndexing] Index error:", err);
        throw err;
      }
    },
    [kbId, existingKBSourceIds, setKbId, createKnowledgeBase, syncKnowledgeBase]
  );

  const deindexFiles = useCallback(
    async (file: FileItem) => {
      if (!kbId || !file.connection_id) {
        console.warn("[useIndexing] No KB or file connection found.");
        return;
      }

      let path = file.inode_path.path;
      if (!path.startsWith("/")) path = `/${path}`;

      try {
        await deleteResourceFromKB(kbId, path);
        await syncKnowledgeBase(kbId);

        const allKB = await fetchKBChildren(kbId, "/");

        const removedIds = allKB
          .filter((kbItem) => {
            let p = kbItem.inode_path.path;
            if (!p.startsWith("/")) p = `/${p}`;
            return p === path || p.startsWith(`${path}/`);
          })
          .map((kbItem) => kbItem.resource_id);

        let updated = existingKBSourceIds.filter(
          (id) => !removedIds.includes(id)
        );
        updated = updated.filter((id) => id !== file.resource_id);

        if (updated.length > 0) {
          await createKnowledgeBase({
            connectionId: file.connection_id,
            connectionSourceIds: updated,
            name: "My Hybrid KB",
          });
          await syncKnowledgeBase(kbId);
        }
      } catch (err) {
        console.error("[useIndexing] Deindex error:", err);
        throw err;
      }
    },
    [
      kbId,
      existingKBSourceIds,
      deleteResourceFromKB,
      createKnowledgeBase,
      syncKnowledgeBase,
      fetchKBChildren,
    ]
  );

  return { indexFiles, deindexFiles };
}
