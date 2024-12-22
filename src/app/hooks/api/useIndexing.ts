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
  } = useKnowledgeBase();

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

  const recursivelyRemoveFolder = useCallback(
    async (kbId: string, folderPath: string) => {
      const children = await fetchKBChildren(kbId, folderPath);

      for (const child of children) {
        let childPath = child.inode_path.path;
        if (!childPath.startsWith("/")) {
          childPath = `/${childPath}`;
        }

        if (child.inode_type === "directory") {
          await recursivelyRemoveFolder(kbId, childPath);
        } else {
          await deleteResourceFromKB(kbId, childPath);
        }
      }

      await deleteResourceFromKB(kbId, folderPath);
    },
    [fetchKBChildren, deleteResourceFromKB]
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
        if (file.inode_type === "directory") {
          await recursivelyRemoveFolder(kbId, path);
        } else {
          await deleteResourceFromKB(kbId, path);
        }

        await syncKnowledgeBase(kbId);

        const allKB = await fetchKBChildren(kbId, "/");

        const stillInKBIds = new Set<string>(
          allKB.map((kbItem: any) => kbItem.resource_id)
        );

        const updated = existingKBSourceIds.filter((id) =>
          stillInKBIds.has(id)
        );

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
      recursivelyRemoveFolder,
    ]
  );

  return { indexFiles, deindexFiles };
}
