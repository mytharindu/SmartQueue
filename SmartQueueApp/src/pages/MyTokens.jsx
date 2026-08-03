import { Link } from "react-router-dom";
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
import { Calendar, Clock, MapPin, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/Progress";


import { myTokens } from "@/lib/mock-data";

export default function MyTokensPage() {
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
            <div className="space-y-4">
                {myTokens.map((token) => {
                    const progress =
                        token.status === "waiting" ? Math.max(20, 100 - token.position * 25) : 0;
                    return (
                        <Card
                            key={token.id}
                            className="overflow-hidden bg-gradient-card shadow-card border-border/50"
                        >
                            <CardContent className="grid items-center gap-6 p-6 md:grid-cols-[auto_1fr_auto]">
                                <div
                                    className={cn(
                                        "rounded-2xl px-6 py-5 text-center",
                                        token.status === "waiting"
                                            ? "bg-gradient-hero text-primary-foreground shadow-glow"
                                            : "bg-muted",
                                    )}
                                >
                                    <p className="text-[10px] uppercase tracking-widest opacity-80">
                                        Token
                                    </p>
                                    <p className="mt-0.5 font-mono text-3xl font-bold">{token.id}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-semibold">{token.service}</h3>
                                        {token.status === "waiting" ? (
                                            <Badge className="border border-success/30 bg-success/15 text-success">
                                                Active · Position #{token.position}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Scheduled</Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {token.date}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {token.time}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {token.counter}
                                        </span>
                                    </div>
                                    {
                                        token.status === "waiting" && (
                                            <div className="pt-2">
                                                <div className="mb-1.5 flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Estimated wait</span>
                                                    <span className="font-semibold text-primary">~{token.eta} min</span>
                                                </div>
                                                <Progress value={progress} />
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="flex gap-2 md:flex-col">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            toast("Reschedule", { description: "Demo only" })
                                        }
                                    >
                                        <RefreshCw className="mr-1 h-3.5 w-3.5" />
                                        Reschedule
                                    </Button>
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
                                                <AlertDialogTitle>Cancel token {token.id}?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {"This will release your slot. You'll need to book again to get a new token."}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep token</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        toast("Cancelled", {
                                                            description: `Token ${token.id} cancelled`,
                                                        })
                                                    }
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