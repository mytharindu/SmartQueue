import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  Users,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getAllServices, getAllCounters } from "@/lib/api";


function Stat({ icon: Icon, value, label, tone }) {
  return (
    <Card className="bg-gradient-card p-5 shadow-card border-border/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export default function IndexPage() {
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: getAllServices,
  });
  const { data: counters = [] } = useQuery({
    queryKey: ["counters"],
    queryFn: getAllCounters,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-glow md:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <Badge className="border border-white/30 bg-white/20 text-primary-foreground hover:bg-white/30">
            <Sparkles className="mr-1 h-3 w-3" /> Government of Sri Lanka · Digital Services
          </Badge>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-balance md:text-5xl">
            Skip the queue.
            <br />
            Get served on time.
          </h1>
          <p className="mt-4 max-w-xl text-base text-balance opacity-90 md:text-lg">
            Book a digital token for passport, driving license, NIC and more. Track your position
            live — no more wasted hours waiting in line.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/book">
              <Button
                size="lg"
                className="bg-card font-semibold text-primary hover:bg-card/90"
              >
                Book Appointment <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/live">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20"
              >
                View Live Queue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat icon={Users} value="2,847" label="Citizens served today" tone="bg-primary/10 text-primary" />
        <Stat icon={Clock} value="14 min" label="Avg waiting time" tone="bg-accent/15 text-accent-foreground" />
        <Stat icon={TrendingDown} value="-72%" label="Wait time reduction" tone="bg-success/15 text-success" />
        <Stat icon={Zap} value="98.4%" label="On-time service rate" tone="bg-warning/15 text-warning" />
      </section>


      {/* Services */}

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Available services</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a service to book your slot
            </p>
          </div>
          <Link to="/book">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service._id} to="/book" className="group">
              <Card className="h-full bg-gradient-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow border-border/50">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{service.icon}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold transition group-hover:text-primary">
                      {service.name}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {service.office}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />~{service.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        {service.docs?.length ?? 0} docs
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      {/* Live counters preview */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Counters now serving</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {counters.map((counter) => (
            <Card key={counter._id} className="bg-card p-5 shadow-card border-border/50">
              <p className="text-xs text-muted-foreground">
                {counter.counterName} · {counter.service?.serviceName}
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-primary">
                {counter.currentToken?.tokenNumber ?? "—"}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {counter.officer?.officerName ?? "Unassigned"}
                </span>
                <Badge variant="secondary">{counter.waitingQueue?.count ?? 0} waiting</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
