import { useState } from "react";
import { toast } from "sonner";
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

import { officerQueue } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function OfficerPage() {

    const [queue, setQueue] = useState(officerQueue);
    const serving = queue.find((q) => q.status === "serving");
    const next = queue.filter((q) => q.status !== "serving");

    const callNext = () => {
        if (next.length === 0) return;
        const [head, ...rest] = next;
        setQueue([
            { ...head, status: "serving", waited: 0 },
            ...rest.map((r, i) => ({
                ...r,
                status: i === 0 ? "next" : "waiting",
            })),
        ]);
        toast.success(`Now calling ${head.token}`);
    };

    const complete = () => {
        if (serving) {
            toast.success(`${serving.token} completed`);
            callNext();
        }
    };

    const skip = () => {
        if (serving) {
            toast(`${serving.token} skipped`);
            setQueue(queue.filter((q) => q.token !== serving.token));
        }
    };

    const stats = [
        { label: "Today", value: "42", tone: "" },
        { label: "Waiting", value: String(queue.length - 1), tone: "text-warning" },
        { label: "Avg/serve", value: "12m", tone: "" },
    ];

    return (
        <div className="mx-auto max-w-7xl p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                        Counter 1 · Passport Application
                    </p>
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
                                {serving.token}
                            </CardTitle>
                        )}
                    </CardHeader>
                    <CardContent>
                        {serving ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <User2 className="h-4 w-4" />
                                        <span className="font-medium">{serving.citizen}</span>
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
                                        className="bg-card font-semibold text-primary hover:bg-card/90"
                                    >
                                        <Check className="mr-1 h-4 w-4" />
                                        Complete
                                    </Button>
                                    <Button
                                        onClick={callNext}
                                        size="lg"
                                        variant="outline"
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
                                                <AlertDialogTitle>Skip token {serving.token}?</AlertDialogTitle>
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
                            <p className="opacity-80">No active token</p>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="text-base">Up next ({next.length})</CardTitle>
                        <CardDescription>Queued citizens for this counter</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Token</TableHead>
                                    <TableHead>Citizen</TableHead>
                                    <TableHead className="text-right">Waited</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {next.map((q, i) => (
                                    <TableRow
                                        key={q.token}
                                        className={q.status === "next" ? "bg-primary/5" : ""}
                                    >
                                        <TableCell className="font-semibold text-muted-foreground">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold">{q.token}</span>
                                                {q.priority && (
                                                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                                )}
                                                {q.status === "next" && (
                                                    <Badge>Next</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{q.citizen}</TableCell>
                                        <TableCell className="text-right font-mono">{q.waited}m</TableCell>
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