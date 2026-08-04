import { useQuery } from "@tanstack/react-query";
import { getAllCounters, getAllTokens } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Radio } from "lucide-react";

function timeAgo(dateString) {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(dateString).getTime()) / 60000));
    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 min ago";
    return `${minutes} min ago`;
}

export default function LivePage() {
    const { data: counters = [] } = useQuery({
        queryKey: ["counters"],
        queryFn: getAllCounters,
        refetchInterval: 4000,
    });
    const { data: tokens = [] } = useQuery({
        queryKey: ["tokens"],
        queryFn: getAllTokens,
        refetchInterval: 4000,
    });

    const recentCalls = tokens
        .filter((t) => t.counter?.counterName && ["called", "serving", "completed"].includes(t.status))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);

    return (
        <div className="mx-auto max-w-7xl p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Live queue board</h1>
                    <p className="mt-1 text-muted-foreground">Now serving across all counters</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/15 px-3 py-1.5 text-xs font-semibold text-success">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                    </span>
                    LIVE · refreshing every few seconds
                </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {counters.map((c) => (
                    <Card key={c._id} className="relative overflow-hidden bg-gradient-card p-6 shadow-card border-border/50">
                        <div className="absolute -mr-8 -mt-8 right-0 top-0 h-24 w-24 rounded-full bg-primary/5" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {c.counterName}
                        </p>
                        <p className="mt-0.5 text-sm text-foreground/80">{c.service?.serviceName}</p>
                        <div className="my-6 text-center">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                Now serving
                            </p>
                            <p
                                key={c.currentToken?.tokenNumber ?? "none"}
                                className="mt-1 animate-fade-in-up font-mono text-6xl font-bold text-primary"
                            >
                                {c.currentToken?.tokenNumber ?? "—"}
                            </p>
                        </div>

                        <div className="space-y-1.5 border-t border-border/60 pt-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Officer</span>
                                <span className="font-medium">{c.officer?.officerName ?? "Unassigned"}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Waiting</span>
                                <Badge variant="secondary">{c.waitingQueue?.count ?? 0}</Badge>
                            </div>
                        </div>
                    </Card>
                ))}
                {counters.length === 0 && (
                    <Card className="col-span-full bg-card p-8 text-center shadow-card">
                        <p className="text-muted-foreground">No counters are open right now.</p>
                    </Card>
                )}
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Card className="bg-card p-6 shadow-card">
                    <h3 className="flex items-center gap-2 font-semibold">
                        <Radio className="h-4 w-4 text-primary" />
                        Recent calls
                    </h3>
                    <div className="mt-4 space-y-2">
                        {recentCalls.length === 0 && (
                            <p className="text-sm text-muted-foreground">No calls yet.</p>
                        )}
                        {recentCalls.map((t) => (
                            <div
                                key={t._id}
                                className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
                            >
                                <span className="font-mono font-semibold">{t.tokenNumber}</span>
                                <span className="text-xs text-muted-foreground">
                                    {t.counter.counterName} · {timeAgo(t.updatedAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="bg-card p-6 shadow-card">
                    <h3 className="font-semibold">Queue overview</h3>
                    <div className="mt-4 space-y-3">
                        {counters.map((c) => (
                            <div key={c._id}>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span>{c.service?.serviceName}</span>
                                    <span className="text-muted-foreground">
                                        {c.waitingQueue?.count ?? 0} waiting
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-gradient-hero"
                                        style={{ width: `${Math.min(100, (c.waitingQueue?.count ?? 0) * 8)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
