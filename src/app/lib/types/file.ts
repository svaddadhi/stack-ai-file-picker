export interface FileItem {
  resource_id: string;
  connection_id?: string;
  inode_type: "file" | "directory";
  inode_path: {
    path: string;
  };
  metadata?: {
    size?: number;
    modifiedDate?: string;
    type?: string;
  };
  status?: "indexed" | "pending" | "not-indexed";
  isPending?: boolean;
  isIndexed?: boolean;
}
