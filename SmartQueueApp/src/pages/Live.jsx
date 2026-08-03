import { useEffect, useState } from "react";
import { counters } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Radio } from "lucide-react";

export default function LivePage() {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const i = setInterval(() => setTick((t) => t + 1), 4000);
        return () => clearInterval(i);
    }, []);

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
                    LIVE · updated just now
                </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {counters.map((c, idx) => {
                    const [prefix, suffix] = c.current.split("-");
                    const num = parseInt(suffix, 10) + (Math.floor(tick / 2) % 3);
                    const display = `${prefix}-${String(num).padStart(3, "0")}`;
                    const waiting = Math.max(
                        1,
                        c.waiting + (idx % 2 === 0 ? -(tick % 3) : 0),
                    );
                    return (
                        <Card key={c.id} className="relative overflow-hidden bg-gradient-card p-6 shadow-card border-border/50">

                            <div className="absolute -mr-8 -mt-8 right-0 top-0 h-24 w-24 rounded-full bg-primary/5" />
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                {c.name}
                            </p>
                            <p className="mt-0.5 text-sm text-foreground/80">{c.service}</p>
                            <div className="my-6 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Now serving
                                </p>
                                <p
                                    key={display}
                                    className="mt-1 animate-fade-in-up font-mono text-6xl font-bold text-primary"
                                >
                                    {display}
                                </p>
                            </div>

                            <div className="space-y-1.5 border-t border-border/60 pt-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Officer</span>
                                    <span className="font-medium">{c.officer}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Waiting</span>
                                    <Badge variant="secondary">{waiting}</Badge>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Card className="bg-card p-6 shadow-card">
                    <h3 className="flex items-center gap-2 font-semibold">
                        <Radio className="h-4 w-4 text-primary" />
                        Recent calls
                    </h3>
                    <div className="mt-4 space-y-2">
                        {[
                            "P-041 → Counter 1",
                            "L-018 → Counter 2",
                            "N-072 → Counter 3",
                            "B-027 → Counter 4",
                            "P-040 → Counter 1",
                        ].map((line, i) => {
                            const [token, dest] = line.split(" → ");
                            return (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
                                >
                                    <span className="font-mono font-semibold">{token}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {dest} · {i + 1} min ago
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
                <Card className="bg-card p-6 shadow-card">
                    <h3 className="font-semibold">Queue overview</h3>
                    <div className="mt-4 space-y-3">
                        {counters.map((c) => (
                            <div
                                key={c.id}>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span>{c.service}</span>
                                    <span className="text-muted-foreground">{c.waiting} waiting</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-gradient-hero"
                                        style={{ width: `${Math.min(100, c.waiting * 8)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div >
    )
}


