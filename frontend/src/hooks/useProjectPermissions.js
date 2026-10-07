import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getPermissions } from "@/lib/permissions";

// Use in pages that don't already load the member list (e.g. TaskDetail).
export function useProjectPermissions(projectId, { skip = false } = {}) {
  const { user } = useAuth();
  const myId = user?._id || user?.id;
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (skip) return undefined;
    let ignore = false;

    const load = async () => {
      setLoading(true);
      const res = await api.get(`/project/getMember/${projectId}`);
      if (ignore) return;
      const me = res.success ? (res.data || []).find((m) => (m.user?._id || m.user) === myId) : null;
      setRole(me?.role || null);
      setLoading(false);
    };

    load();
    return () => {
      ignore = true;
    };
  }, [projectId, myId, skip]);

  return { role, can: getPermissions(role), loading };
}
