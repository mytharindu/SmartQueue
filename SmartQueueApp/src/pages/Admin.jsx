import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
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

import { queueHistory, services } from "@/lib/mock-data";

function exportCsv() {
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

const KPIS = [
    {
        icon: Users,
        label: "Citizens served",
        value: "988",
        trend: "+12%",
        tone: "bg-primary/10 text-primary",
    },
    {
        icon: Clock,
        label: "Avg wait time",
        value: "22 min",
        trend: "-18%",
        tone: "bg-success/15 text-success",
    },
    {
        icon: TrendingUp,
        label: "Peak load",
        value: "11:00 AM",
        trend: "71 tokens",
        tone: "bg-warning/15 text-warning",
    },
    {
        icon: AlertCircle,
        label: "Skipped tokens",
        value: "14",
        trend: "1.4%",
        tone: "bg-destructive/10 text-destructive",
    },
];

const hourly = [
    { h: "8a", v: 12 },
    { h: "9a", v: 38 },
    { h: "10a", v: 62 },
    { h: "11a", v: 71 },
    { h: "12p", v: 45 },
    { h: "1p", v: 28 },
    { h: "2p", v: 58 },
    { h: "3p", v: 49 },
    { h: "4p", v: 22 },
];

export default function AdminPage() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Admin analytics</h1>
                    <p className="mt-1 text-muted-foreground">
                        Performance across all services & counters · last 7 days
                    </p>
                </div>
                <Button onClick={exportCsv}>
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
                                        <YAxis stroke="currentColor" fontSize={12} />
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
                            <CardDescription>Trending down — efficiency up</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={queueHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
                                        <YAxis stroke="currentColor" fontSize={12} />
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
                                        <YAxis stroke="currentColor" fontSize={12} />
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
                                Tokens issued and average wait per service
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
                                    {services.map((s, i) => {
                                        const busy = i % 3 === 2;
                                        return (
                                            <TableRow key={s.id}>
                                                <TableCell className="font-medium">
                                                    <span className="mr-2">{s.icon}</span>
                                                    {s.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{s.office}</TableCell>
                                                <TableCell className="text-right font-mono"> {180 - i * 22}</TableCell>
                                                <TableCell className="text-right font-mono">{s.duration - 5 + i}m</TableCell>
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