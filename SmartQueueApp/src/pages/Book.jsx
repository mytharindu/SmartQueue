import { useState, useEffect} from "react";

import { toast } from "sonner";
import { Check, Clock, FileText, Calendar, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { services } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:30", "14:00", "14:30", "15:00"];
const TAKEN = new Set(["10:00", "11:00", "14:00"]);
const STEPS = ["Service", "Date & time", "Details", "Confirm"];


export default function BookPage() {
    const [step, setStep] = useState(1)
    const [serviceId, setServiceId] = useState(null);
     const [time, setTime] = useState(() => Date.now());
    const [date, setDate] = useState(
        new Date(time + 86400000).toISOString().slice(0, 10),
    );
    const [slot, setSlot] = useState(null);
    const [priority, setPriority] = useState(false);
    const [token, setToken] = useState(null);

    const service = services.find((s) => s.id === serviceId);

    const confirm = () => {
        const t = `${service.name[0]}-${Math.floor(Math.random() * 900 + 100)}`;
        setToken(t);
        setStep(4);
        toast.success("Appointment confirmed", { description: `Your token is ${t}` });
    };

    const reset = () => {
        setStep(1);
        setServiceId(null);
        setSlot(null);
        setToken(null);
    };

    useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);


    return (
        <div className="mx-auto max-w-5xl p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Book an appointment</h1>
                <p className="mt-1 text-muted-foreground">
                    Pick a service, time and confirm — takes under a minute.
                </p>
            </div>

            {/* Stepper */}
            <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
                {STEPS.map((label, i) => {
                    const n = i + 1;
                    const active = step === n;
                    const done = step > n;
                    return (
                        <div key={label} className="flex shrink-0 items-center gap-2">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition",
                                    done
                                        ? "bg-success text-success-foreground"
                                        : active
                                            ? "bg-primary text-primary-foreground shadow-glow"
                                            : "bg-muted text-muted-foreground",
                                )}
                            >
                                {done ? <Check className="h-4 w-4" /> : n}
                            </div>
                            <span className={cn("text-sm", active ? "font-semibold" : "text-muted-foreground")}>
                                {label}
                            </span>
                            {n < 4 && <div className="mx-1 h-px w-8 bg-border" />}
                        </div>
                    );
                })}
            </div>

            {/* Step 1: Service */}
            {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((s) => (
                        <Card
                            key={s.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                setServiceId(s.id);
                                setStep(2);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    setServiceId(s.id);
                                    setStep(2);
                                }
                            }}
                            className={cn(
                                "cursor-pointer bg-gradient-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow border-border/50",
                                serviceId === s.id && "border-primary ring-2 ring-primary/30",
                            )}
                        >
                            <div className="text-3xl">{s.icon}</div>
                            <h3 className="mt-3 font-semibold">{s.name}</h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">{s.office}</p>
                            <div className="mt-3 flex gap-2">
                                <Badge variant="secondary">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {s.duration} min
                                </Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            {/* Step 2: Date & time */}
            {step === 2 && service && (
                <Card className="bg-card p-6 shadow-card">
                    <Label className="text-base">Choose date</Label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-2 max-w-xs"
                    />
                    <div className="mt-6">
                        <Label className="text-base">Available time slots</Label>
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {SLOTS.map((t) => {
                                const taken = TAKEN.has(t);
                                const sel = slot === t;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        disabled={taken}
                                        onClick={() => setSlot(t)}
                                        className={cn(
                                            "rounded-lg border px-3 py-2.5 font-mono text-sm font-semibold transition",
                                            taken
                                                ? "cursor-not-allowed bg-muted text-muted-foreground/50 line-through"
                                                : sel
                                                    ? "border-primary bg-primary text-primary-foreground shadow-glow"
                                                    : "bg-card hover:border-primary hover:text-primary",
                                        )}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-8 flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(1)}>
                            Back
                        </Button>
                        <Button onClick={() => setStep(3)} disabled={!slot}>
                            Continue
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 3: Details */}
            {step === 3 && service && (
                <Card className="space-y-5 bg-card p-6 shadow-card">
                    <div>
                        <Label>Full name (as in NIC)</Label>
                        <Input defaultValue="A. Perera" className="mt-1.5" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>NIC number</Label>
                            <Input defaultValue="200145600789" className="mt-1.5 font-mono" />
                        </div>
                        <div>
                            <Label>Mobile</Label>
                            <Input defaultValue="+94 77 123 4567" className="mt-1.5" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                            <FileText className="h-4 w-4" />
                            Required documents
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {service.docs.map((d) => (
                                <li key={d} className="flex items-center gap-2">
                                    <Check className="h-3.5 w-3.5 text-success" />
                                    {d}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/40">
                        <Checkbox
                            checked={priority}
                            onCheckedChange={(v) => setPriority(v === true)}
                            className="mt-0.5"
                        />
                        <div>
                            <p className="flex items-center gap-2 text-sm font-medium">
                                <ShieldAlert className="h-4 w-4 text-warning" />
                                Priority booking
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                For elderly (60+), pregnant women, persons with disabilities, or urgent medical
                                cases.
                            </p>
                        </div>
                    </label>
                    <div className="flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(2)}>
                            Back
                        </Button>
                        <Button onClick={confirm}>Confirm booking</Button>
                    </div>
                </Card>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && service && token && (
                <Card className="bg-gradient-card border-primary/30 p-8 text-center shadow-glow">
                    <div className="mx-auto flex h-16 w-16 animate-pulse-ring items-center justify-center rounded-full bg-success/15 text-success">
                        <Check className="h-8 w-8" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold">Appointment confirmed</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        A confirmation has been sent to your mobile.
                    </p>
                    <div className="mt-6 inline-block rounded-2xl bg-gradient-hero px-8 py-6 text-primary-foreground shadow-glow">
                        <p className="text-xs uppercase tracking-widest opacity-80">Your token</p>
                        <p className="mt-1 font-mono text-5xl font-bold">{token}</p>
                    </div>
                    <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-lg border border-border p-3">
                            <p className="text-xs text-muted-foreground">Service</p>
                            <p className="font-semibold">{service.name}</p>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Date
                            </p>
                            <p className="font-semibold">{date}</p>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Time
                            </p>
                            <p className="font-mono font-semibold">{slot}</p>
                        </div>
                    </div>
                    {priority && (
                        <Badge className="mt-4 border-warning/40 bg-warning/20 text-warning-foreground">
                            Priority booking
                        </Badge>
                    )}
                    <div className="mt-6 flex justify-center gap-3">
                        <Button variant="outline" onClick={reset}>
                            Book another
                        </Button>
                        <Link to="/my-tokens">
                            <Button>View my tokens</Button>
                        </Link>
                    </div>
                </Card>
            )}
        </div>
    );
}