import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { getAllTokens, cancelToken } from "@/lib/api";

const ACTIVE_STATUSES = ["pending", "called", "serving"];

export default function MyTokensPage() {
    const queryClient = useQueryClient();
    const { data: tokens = [], isLoading } = useQuery({
        queryKey: ["tokens"],
        queryFn: getAllTokens,
    });

    const cancellation = useMutation({
        mutationFn: cancelToken,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["tokens"] });
            toast("Cancelled", { description: "Your token has been cancelled" });
        },
        onError: (error) => {
            toast.error("Could not cancel token", { description: error.message });
        },
    });

    const activeTokens = tokens.filter((t) => ACTIVE_STATUSES.includes(t.status));

    return (
        <div className="mx-auto max-w-5xl p-6 md:p-8">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My tokens</h1>
                    <p className="mt-1 text-muted-foreground">Active and upcoming appointments</p>
                </div>
                <Link to="/book">
                    <Button>+ New booking</Button>
                </Link>
            </div>
            {!isLoading && activeTokens.length === 0 && (
                <Card className="bg-card p-8 text-center shadow-card">
                    <p className="text-muted-foreground">No active tokens yet.</p>
                    <Link to="/book" className="mt-3 inline-block">
                        <Button>Book an appointment</Button>
                    </Link>
                </Card>
            )}
            <div className="space-y-4">
                {activeTokens.map((token) => {
                    const beingServed = token.status === "called" || token.status === "serving";
                    return (
                        <Card
                            key={token._id}
                            className="overflow-hidden bg-gradient-card shadow-card border-border/50"
                        >
                            <CardContent className="grid items-center gap-6 p-6 md:grid-cols-[auto_1fr_auto]">
                                <div
                                    className={cn(
                                        "rounded-2xl px-6 py-5 text-center",
                                        beingServed
                                            ? "bg-gradient-hero text-primary-foreground shadow-glow"
                                            : "bg-muted",
                                    )}
                                >
                                    <p className="text-[10px] uppercase tracking-widest opacity-80">
                                        Token
                                    </p>
                                    <p className="mt-0.5 font-mono text-3xl font-bold">{token.tokenNumber}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-semibold">{token.service?.serviceName}</h3>
                                        {beingServed ? (
                                            <Badge className="border border-success/30 bg-success/15 text-success">
                                                Now serving
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Pending</Badge>
                                        )}
                                        {token.priority && token.priorityStatus === "accepted" && (
                                            <Badge className="border border-success/30 bg-success/15 text-success">
                                                Priority confirmed
                                            </Badge>
                                        )}
                                        {token.priority && token.priorityStatus === "pending" && (
                                            <Badge className="border border-warning/40 bg-warning/20 text-warning-foreground">
                                                Priority under review
                                            </Badge>
                                        )}
                                        {token.priority && token.priorityStatus === "rejected" && (
                                            <Badge variant="secondary" title={token.priorityReason}>
                                                Priority not approved
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(token.bookedDate).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {new Date(token.bookedDate).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        {token.counter?.counterName && (
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {token.counter.counterName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 md:flex-col">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <X className="mr-1 h-3.5 w-3.5" />
                                                Cancel
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel token {token.tokenNumber}?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {"This will release your slot. You'll need to book again to get a new token."}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep token</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => cancellation.mutate(token._id)}
                                                >
                                                    Cancel booking
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}