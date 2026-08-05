import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Users, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

import { getAllServices, getServiceSlots } from '@/lib/api';

function todayLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TimeSlotsPage() {
    const [serviceId, setServiceId] = useState('');
    const [date, setDate] = useState(todayLocal());

    const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: getAllServices });

    const selectedServiceId = serviceId || services[0]?._id || '';

    const { data: slotData, isLoading } = useQuery({
        queryKey: ['timeslots', selectedServiceId, date],
        queryFn: () => getServiceSlots(selectedServiceId, date),
        enabled: !!selectedServiceId,
    });

    const selectedService = services.find((s) => s._id === selectedServiceId);

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Time Slots</h1>
                <p className="text-muted-foreground">
                    Slots are generated automatically from each service's duration, the department's operating
                    hours, and the number of active counters assigned to it — there's nothing to configure here.
                </p>
            </div>

            <Card>
                <CardContent className="flex flex-wrap items-end gap-4 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="service">Service</Label>
                        <select
                            id="service"
                            value={selectedServiceId}
                            onChange={(e) => setServiceId(e.target.value)}
                            className="flex h-9 w-64 rounded-md border border-input bg-input px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            {services.map((s) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-48 bg-input"
                        />
                    </div>
                </CardContent>
            </Card>

            {!isLoading && slotData && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Counters serving this</p>
                                <p className="text-2xl font-bold">{slotData.countersAvailable}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Slot length</p>
                                <p className="text-2xl font-bold">{slotData.slotDurationMinutes}m</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning">
                                <Coffee className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Break window</p>
                                <p className="text-2xl font-bold">
                                    {slotData.breakWindow.start}–{slotData.breakWindow.end}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {selectedService?.name ?? 'Service'} · {date}
                    </CardTitle>
                    <CardDescription>
                        Each slot can hold one booking per active counter assigned to this service.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
                    {!isLoading && slotData?.isClosed && (
                        <p className="text-sm text-muted-foreground">
                            No slots for this date — the department is closed, or no active counters are assigned
                            to this service yet.
                        </p>
                    )}
                    {!isLoading && slotData && !slotData.isClosed && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Booked</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {slotData.slots.map((s) => (
                                    <TableRow key={s.time}>
                                        <TableCell className="font-mono font-medium">{s.time}</TableCell>
                                        <TableCell>{s.capacity}</TableCell>
                                        <TableCell>{s.booked}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    'border',
                                                    s.available
                                                        ? 'border-success/30 bg-success/15 text-success'
                                                        : 'border-destructive/30 bg-destructive/15 text-destructive',
                                                )}
                                            >
                                                {s.available ? 'Available' : 'Full'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
