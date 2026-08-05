import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/Card";
import { ChevronRight, SkipForward, Check, Star, User2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/AlertDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";

import { getAllCounters, getAllTokens, callToken, completeToken, cancelToken } from "@/lib/api";
import { cn } from "@/lib/utils";

function isToday(dateString) {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

function minutesBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 60000);
}

export default function OfficerPage() {
    const queryClient = useQueryClient();
    const [selectedCounterId, setSelectedCounterId] = useState(null);

    const { data: counters = [] } = useQuery({
        queryKey: ["counters"],
        queryFn: getAllCounters,
    });
    const { data: tokens = [] } = useQuery({
        queryKey: ["tokens"],
        queryFn: getAllTokens,
        refetchInterval: 5000,
    });

    useEffect(() => {
        if (!selectedCounterId && counters.length > 0) {
            setSelectedCounterId(counters[0]._id);
        }
    }, [counters, selectedCounterId]);

    const counter = counters.find((c) => c._id === selectedCounterId);

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["tokens"] });
        queryClient.invalidateQueries({ queryKey: ["counters"] });
    };

    const callMutation = useMutation({
        mutationFn: ({ tokenId, counterNumber }) => callToken(tokenId, counterNumber),
        onSuccess: (token) => {
            invalidate();
            toast.success(`Now calling ${token.tokenNumber}`);
        },
        onError: (error) => toast.error(error.message),
    });

    const completeMutation = useMutation({
        mutationFn: completeToken,
        onSuccess: (token) => {
            invalidate();
            toast.success(`${token.tokenNumber} completed`);
        },
        onError: (error) => toast.error(error.message),
    });

    const skipMutation = useMutation({
        mutationFn: cancelToken,
        onSuccess: (token) => {
            invalidate();
            toast(`${token.tokenNumber} skipped`);
        },
        onError: (error) => toast.error(error.message),
    });

    const serving = tokens.find(
        (t) => t.counter?.counterId === counter?._id && ["called", "serving"].includes(t.status)
    );

    const pendingQueue = tokens
        .filter(
            (t) =>
                t.status === "pending" &&
                t.counter?.counterId === counter?._id &&
                isToday(t.bookedDate)
        )
        .sort((a, b) => {
            if (a.priority !== b.priority) return a.priority ? -1 : 1;
            return new Date(a.bookedDate) - new Date(b.bookedDate);
        });

    const completedToday = tokens.filter(
        (t) => t.counter?.counterId === counter?._id && t.status === "completed" && isToday(t.timing?.serviceEndTime)
    );
    const avgServeMinutes = (() => {
        const durations = completedToday
            .filter((t) => t.timing?.serviceStartTime && t.timing?.serviceEndTime)
            .map((t) => minutesBetween(t.timing.serviceStartTime, t.timing.serviceEndTime));
        if (durations.length === 0) return null;
        return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    })();

    const stats = [
        { label: "Today", value: String(completedToday.length), tone: "" },
        { label: "Waiting", value: String(pendingQueue.length), tone: "text-warning" },
        { label: "Avg/serve", value: avgServeMinutes !== null ? `${avgServeMinutes}m` : "—", tone: "" },
    ];

    const callNext = () => {
        if (!counter || pendingQueue.length === 0) return;
        callMutation.mutate({ tokenId: pendingQueue[0]._id, counterNumber: counter.counterNumber });
    };

    const complete = () => {
        if (serving) {
            completeMutation.mutate(serving._id);
        }
    };

    const skip = () => {
        if (serving) {
            skipMutation.mutate(serving._id);
        }
    };

    if (counters.length === 0) {
        return (
            <div className="mx-auto max-w-7xl p-6 md:p-8">
                <Card className="bg-card p-8 text-center shadow-card">
                    <p className="text-muted-foreground">
                        No counters are set up yet. Add one from the Counters page first.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <select
                        value={selectedCounterId ?? ""}
                        onChange={(e) => setSelectedCounterId(e.target.value)}
                        className="rounded-md border border-input bg-transparent px-2 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
                    >
                        {counters.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.counterName} · {c.service?.serviceName}
                            </option>
                        ))}
                    </select>
                    <h1 className="mt-1 text-3xl font-bold">Officer panel</h1>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {stats.map((s) => (
                        <Card key={s.label} className="border-border/50">
                            <CardContent className="px-4 py-2 text-center">
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                                <p className={cn("font-display text-xl font-bold", s.tone)}>
                                    {s.value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                <Card className="relative overflow-hidden border-0 bg-gradient-hero text-primary-foreground shadow-glow">
                    <CardHeader>
                        <CardDescription className="text-xs uppercase tracking-widest text-primary-foreground/80"> Now serving</CardDescription>
                        {serving && (
                            <CardTitle className="mt-2 font-mono text-7xl font-bold">
                                {serving.tokenNumber}
                            </CardTitle>
                        )}
                    </CardHeader>
                    <CardContent>
                        {serving ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <User2 className="h-4 w-4" />
                                        <span className="font-medium">{serving.citizen?.name}</span>
                                    </div>
                                    {serving.priority && (
                                        <Badge className="border-0 bg-warning text-warning-foreground">
                                            <Star className="mr-1 h-3 w-3" />
                                            Priority
                                        </Badge>
                                    )}
                                </div>
                                <div className="relative mt-6 flex flex-wrap gap-2">
                                    <Button
                                        onClick={complete}
                                        size="lg"
                                        disabled={completeMutation.isPending}
                                        className="bg-card font-semibold text-primary hover:bg-card/90"
                                    >
                                        <Check className="mr-1 h-4 w-4" />
                                        Complete
                                    </Button>
                                    <Button
                                        onClick={callNext}
                                        size="lg"
                                        variant="outline"
                                        disabled={callMutation.isPending || pendingQueue.length === 0}
                                        className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20"
                                    >
                                        <ChevronRight className="mr-1 h-4 w-4" />
                                        Call next
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="lg"
                                                variant="ghost"
                                                className="text-primary-foreground hover:bg-white/10"
                                            >
                                                <SkipForward className="mr-1 h-4 w-4" />
                                                Skip
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Skip token {serving.tokenNumber}?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    The citizen will be marked as no-show and the next token will
                                                    be called.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={skip}>Skip token</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="opacity-80">No active token</p>
                                <Button
                                    onClick={callNext}
                                    size="lg"
                                    disabled={callMutation.isPending || pendingQueue.length === 0}
                                    className="mt-4 bg-card font-semibold text-primary hover:bg-card/90"
                                >
                                    <ChevronRight className="mr-1 h-4 w-4" />
                                    Call next
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="text-base">Up next ({pendingQueue.length})</CardTitle>
                        <CardDescription>Queued citizens for this counter</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Token</TableHead>
                                    <TableHead>Citizen</TableHead>
                                    <TableHead className="text-right">Booked</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingQueue.map((q, i) => (
                                    <TableRow key={q._id} className={i === 0 ? "bg-primary/5" : ""}>
                                        <TableCell className="font-semibold text-muted-foreground">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold">{q.tokenNumber}</span>
                                                {q.priority && (
                                                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                                )}
                                                {i === 0 && <Badge>Next</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{q.citizen?.name}</TableCell>
                                        <TableCell className="text-right font-mono text-xs">
                                            {new Date(q.bookedDate).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
