export const endpoints = {
  connection: {
    list: () => "/connections?connection_provider=gdrive&limit=1",
    resources: (connectionId: string) =>
      `/connections/${connectionId}/resources`,
    children: (connectionId: string, resourceId?: string) => {
      const base = `/connections/${connectionId}/resources/children`;
      return resourceId ? `${base}?resource_id=${resourceId}` : base;
    },
  },
  knowledgeBase: {
    create: "/knowledge_bases",
    sync: (kbId: string, orgId: string) =>
      `/knowledge_bases/sync/trigger/${kbId}/${orgId}`,
    resources: (kbId: string) => `/knowledge_bases/${kbId}/resources`,
    children: (kbId: string, path: string = "/") =>
      `/knowledge_bases/${kbId}/resources/children?resource_path=${encodeURIComponent(
        path
      )}`,
  },
  organization: {
    current: "/organizations/me/current",
  },
};
