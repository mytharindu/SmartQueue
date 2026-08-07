import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, isSameDay } from "date-fns";
import { Download, TrendingUp, Users, Clock, AlertCircle } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/Tabs";
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

import { getAllTokens, getAllServices } from "@/lib/api";

function exportCsv(queueHistory) {
    const rows = [
        ["Day", "Served", "AvgWait(min)"],
        ...queueHistory.map((d) => [d.day, d.served, d.avgWait]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "queue-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
}

const TOOLTIP_STYLE = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 8,
};

export default function AdminPage() {
    const { data: tokens = [] } = useQuery({ queryKey: ["tokens"], queryFn: getAllTokens });
    const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: getAllServices });

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    const completedLast7 = tokens.filter(
        (t) => t.status === "completed" && t.timing?.serviceEndTime && new Date(t.timing.serviceEndTime) >= sevenDaysAgo
    );
    const avgWaitLast7 = completedLast7.length
        ? Math.round(completedLast7.reduce((sum, t) => sum + (t.timing.actualWaitTime || 0), 0) / completedLast7.length)
        : 0;
    const cancelledLast7 = tokens.filter(
        (t) => t.status === "cancelled" && new Date(t.updatedAt) >= sevenDaysAgo
    );
    const issuedLast7 = tokens.filter((t) => new Date(t.createdAt) >= sevenDaysAgo);
    const skippedRate = issuedLast7.length
        ? ((cancelledLast7.length / issuedLast7.length) * 100).toFixed(1)
        : "0.0";

    const todayTokens = tokens.filter((t) => isSameDay(new Date(t.createdAt), now));
    const hourCounts = {};
    todayTokens.forEach((t) => {
        const hour = new Date(t.createdAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const formatHour = (h) => {
        const hour = Number(h);
        const period = hour >= 12 ? "PM" : "AM";
        const display = hour % 12 === 0 ? 12 : hour % 12;
        return `${display}:00 ${period}`;
    };

    const KPIS = [
        {
            icon: Users,
            label: "Citizens served",
            value: String(completedLast7.length),
            trend: "last 7 days",
            tone: "bg-primary/10 text-primary",
        },
        {
            icon: Clock,
            label: "Avg wait time",
            value: `${avgWaitLast7} min`,
            trend: `${completedLast7.length} completions`,
            tone: "bg-success/15 text-success",
        },
        {
            icon: TrendingUp,
            label: "Peak load",
            value: peakHour ? formatHour(peakHour[0]) : "—",
            trend: peakHour ? `${peakHour[1]} tokens today` : "no data today",
            tone: "bg-warning/15 text-warning",
        },
        {
            icon: AlertCircle,
            label: "Cancelled tokens",
            value: String(cancelledLast7.length),
            trend: `${skippedRate}% of issued`,
            tone: "bg-destructive/10 text-destructive",
        },
    ];

    const last7DaysRange = Array.from({ length: 7 }).map((_, i) => subDays(now, 6 - i));
    const queueHistory = last7DaysRange.map((day) => {
        const completedThatDay = tokens.filter(
            (t) => t.status === "completed" && t.timing?.serviceEndTime && isSameDay(new Date(t.timing.serviceEndTime), day)
        );
        const avgWait = completedThatDay.length
            ? Math.round(
                  completedThatDay.reduce((sum, t) => sum + (t.timing.actualWaitTime || 0), 0) / completedThatDay.length
              )
            : 0;
        return { day: format(day, "EEE"), served: completedThatDay.length, avgWait };
    });

    const hourly = Array.from({ length: 9 }).map((_, i) => {
        const hour = 8 + i;
        return { h: formatHour(hour).replace(":00 ", ""), v: hourCounts[hour] || 0 };
    });

    const serviceStats = services.map((s) => {
        const svcTokensLast7 = tokens.filter(
            (t) => t.service?.serviceId === s._id && new Date(t.createdAt) >= sevenDaysAgo
        );
        const completed = svcTokensLast7.filter((t) => t.status === "completed");
        // "Busy" reflects the live queue right now, not history, so it isn't scoped to 7 days.
        const pending = tokens.filter(
            (t) => t.service?.serviceId === s._id && t.status === "pending"
        ).length;
        const avgWait = completed.length
            ? Math.round(completed.reduce((sum, t) => sum + (t.timing?.actualWaitTime || 0), 0) / completed.length)
            : 0;
        return { ...s, issued: svcTokensLast7.length, avgWait, pending };
    });

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Admin analytics</h1>
                    <p className="mt-1 text-muted-foreground">
                        Performance across all services & counters · last 7 days
                    </p>
                </div>
                <Button onClick={() => exportCsv(queueHistory)}>
                    <Download className="mr-1.5 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {KPIS.map((k) => (
                    <Card key={k.label} className="bg-gradient-card shadow-card border-border/50">
                        <CardContent className="flex items-start justify-between p-5">
                            <div>
                                <p className="text-xs text-muted-foreground">{k.label}</p>
                                <p className="mt-1 font-display text-2xl font-bold">{k.value}</p>
                                <p className="mt-1 text-[11px] text-muted-foreground">{k.trend}</p>
                            </div>
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-xl",
                                    k.tone,
                                )}
                            >
                                <k.icon className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="hourly">Hourly</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>
                <TabsContent value="performance" className="mt-5 grid gap-5 lg:grid-cols-2">
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="text-base">Citizens served per day</CardTitle>
                            <CardDescription>Last 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={queueHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
                                        <YAxis stroke="currentColor" fontSize={12} allowDecimals={false} />
                                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                                        <Bar dataKey="served" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="text-base">Average waiting time (min)</CardTitle>
                            <CardDescription>Based on completed tokens per day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={queueHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
                                        <YAxis stroke="currentColor" fontSize={12} allowDecimals={false} />
                                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                                        <Line
                                            type="monotone"
                                            dataKey="avgWait"
                                            stroke="var(--accent)"
                                            strokeWidth={3}
                                            dot={{ fill: "var(--accent)", r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hourly" className="mt-5">
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="text-base">Hourly token issuance</CardTitle>
                            <CardDescription>Peak hours analysis · today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourly}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="h" stroke="currentColor" fontSize={12} />
                                        <YAxis stroke="currentColor" fontSize={12} allowDecimals={false} />
                                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                                        <Bar dataKey="v" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="services" className="mt-5">
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="text-base">Service breakdown</CardTitle>
                            <CardDescription>
                                Tokens issued and average wait per service · last 7 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Office</TableHead>
                                        <TableHead className="text-right">Tokens</TableHead>
                                        <TableHead className="text-right">Avg wait</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {serviceStats.map((s) => {
                                        const busy = s.pending > 5;
                                        return (
                                            <TableRow key={s._id}>
                                                <TableCell className="font-medium">
                                                    <span className="mr-2">{s.icon}</span>
                                                    {s.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{s.office}</TableCell>
                                                <TableCell className="text-right font-mono">{s.issued}</TableCell>
                                                <TableCell className="text-right font-mono">{s.avgWait}m</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={cn(
                                                            "border",
                                                            busy
                                                                ? "border-warning/40 bg-warning/20 text-warning-foreground"
                                                                : "border-success/30 bg-success/15 text-success",
                                                        )}
                                                    >
                                                        {busy ? "Busy" : "Healthy"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
