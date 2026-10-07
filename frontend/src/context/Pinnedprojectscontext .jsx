import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const PinnedProjectsContext = createContext(null);

const readStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Pinned projects are saved per user in this browser (localStorage).
export function PinnedProjectsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const storageKey = userId ? `pinnedProjects:${userId}` : null;
  const [pinned, setPinned] = useState([]); // [{ _id, name }]

  // Load when the user changes (login / logout)
  useEffect(() => {
    setPinned(storageKey ? readStorage(storageKey) : []);
  }, [storageKey]);

  const save = useCallback(
    (next) => {
      setPinned(next);
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage full or blocked: pins still work until refresh */
      }
    },
    [storageKey],
  );

  const isPinned = useCallback((id) => pinned.some((p) => p._id === id), [pinned]);

  const togglePin = useCallback(
    (project) => {
      if (!project?._id) return;
      if (pinned.some((p) => p._id === project._id)) {
        save(pinned.filter((p) => p._id !== project._id));
      } else {
        save([...pinned, { _id: project._id, name: project.name }]);
      }
    },
    [pinned, save],
  );

  const unpin = useCallback(
    (id) => {
      if (pinned.some((p) => p._id === id)) save(pinned.filter((p) => p._id !== id));
    },
    [pinned, save],
  );

  // Keep names fresh and drop projects that no longer exist
  const syncPinned = useCallback(
    (projects) => {
      if (!Array.isArray(projects) || pinned.length === 0) return;
      const byId = new Map(projects.map((p) => [p._id, p]));
      const next = pinned.filter((p) => byId.has(p._id)).map((p) => ({ _id: p._id, name: byId.get(p._id).name }));
      const changed = next.length !== pinned.length || next.some((p, i) => p.name !== pinned[i].name);
      if (changed) save(next);
    },
    [pinned, save],
  );

  const value = useMemo(
    () => ({ pinned, isPinned, togglePin, unpin, syncPinned }),
    [pinned, isPinned, togglePin, unpin, syncPinned],
  );

  return <PinnedProjectsContext.Provider value={value}>{children}</PinnedProjectsContext.Provider>;
}

export function usePinnedProjects() {
  const ctx = useContext(PinnedProjectsContext);
  if (!ctx) throw new Error("usePinnedProjects must be used inside <PinnedProjectsProvider>");
  return ctx;
}
