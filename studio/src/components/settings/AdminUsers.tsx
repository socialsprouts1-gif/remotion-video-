"use client";
import { useRouter } from "next/navigation";
import { api, formatBytes, timeAgo } from "@/lib/api";
import { Badge, Button } from "@/components/ui";
import { toast } from "@/components/ui/toast";

interface U { id: string; email: string; name: string | null; role: string; plan: string; credits: number; disabled: boolean; storageBytes: number; createdAt: string }

export function AdminUsers({ users, selfId }: { users: U[]; selfId: string }) {
  const router = useRouter();
  const patch = async (id: string, body: Record<string, unknown>) => {
    try {
      await api(`/api/admin/users/${id}`, { method: "PATCH", body });
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-xs">
        <thead className="text-left text-ink-400"><tr><th className="py-1">User</th><th>Plan</th><th>Credits</th><th>Storage</th><th>Joined</th><th /></tr></thead>
        <tbody>
          {users.map((x) => (
            <tr key={x.id} className="border-t border-white/[0.05]">
              <td className="py-2"><div className="font-medium">{x.name ?? x.email}</div><div className="text-ink-500">{x.email}</div></td>
              <td>
                <select className="field-sm w-28" value={x.plan} onChange={(e) => patch(x.id, { plan: e.target.value })}>
                  {["FREE", "CREATOR", "STUDIO", "ENTERPRISE"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </td>
              <td className="tabular-nums">{x.credits}</td>
              <td>{formatBytes(x.storageBytes)}</td>
              <td className="text-ink-400">{timeAgo(x.createdAt)}</td>
              <td className="space-x-1 text-right">
                {x.role === "ADMIN" ? <Badge tone="accent">admin</Badge> : null}
                {x.disabled ? <Badge tone="danger">disabled</Badge> : null}
                <Button size="xs" variant="ghost" onClick={() => { const n = Number(prompt("Grant credits (negative to remove)", "500")); if (n) void patch(x.id, { grantCredits: n }); }}>Credits</Button>
                {x.id !== selfId ? <Button size="xs" variant={x.disabled ? "outline" : "danger"} onClick={() => patch(x.id, { disabled: !x.disabled })}>{x.disabled ? "Enable" : "Disable"}</Button> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
