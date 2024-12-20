import { useState, useCallback } from "react";

interface NavigationState {
  currentPath: string;
  currentResourceId?: string;
  pathHistory: { path: string; resourceId?: string }[];
  historyIndex: number;
}

export function useNavigation() {
  const [state, setState] = useState<NavigationState>({
    currentPath: "/",
    pathHistory: [{ path: "/" }],
    historyIndex: 0,
  });

  const navigateToFolder = useCallback((path: string, resourceId?: string) => {
    setState((prev) => {
      const newHistory = prev.pathHistory.slice(0, prev.historyIndex + 1);
      return {
        currentPath: path,
        currentResourceId: resourceId,
        pathHistory: [...newHistory, { path, resourceId }],
        historyIndex: newHistory.length,
      };
    });
  }, []);

  const navigateBack = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex <= 0) return prev;
      const newIndex = prev.historyIndex - 1;
      const { path, resourceId } = prev.pathHistory[newIndex];
      return {
        ...prev,
        currentPath: path,
        currentResourceId: resourceId,
        historyIndex: newIndex,
      };
    });
  }, []);

  const navigateForward = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex >= prev.pathHistory.length - 1) return prev;
      const newIndex = prev.historyIndex + 1;
      const { path, resourceId } = prev.pathHistory[newIndex];
      return {
        ...prev,
        currentPath: path,
        currentResourceId: resourceId,
        historyIndex: newIndex,
      };
    });
  }, []);

  const canGoBack = state.historyIndex > 0;
  const canGoForward = state.historyIndex < state.pathHistory.length - 1;

  return {
    currentPath: state.currentPath,
    currentResourceId: state.currentResourceId,
    navigateToFolder,
    navigateBack,
    navigateForward,
    canGoBack,
    canGoForward,
  };
}
