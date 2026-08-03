import { useState } from 'react';
import { toast } from 'sonner';
import { services } from '@/lib/mock-data';
import { Plus, Trash2, Edit2, X, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';



const mockTimeSlots = [
    { id: 1, serviceId: 'passport', startTime: '09:00', endTime: '12:00', slotsPerHour: 4, maxDaily: 40 },
    { id: 2, serviceId: 'license', startTime: '09:00', endTime: '16:00', slotsPerHour: 3, maxDaily: 35 },
    { id: 3, serviceId: 'nic', startTime: '08:00', endTime: '17:00', slotsPerHour: 6, maxDaily: 50 },
];

export default function TimeSlotsPage() {
    const [timeSlots, setTimeSlots] = useState(mockTimeSlots);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        serviceId: '',
        startTime: '09:00',
        endTime: '17:00',
        slotsPerHour: 4,
        maxDaily: 40,
    });

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ serviceId: '', startTime: '09:00', endTime: '17:00', slotsPerHour: 4, maxDaily: 40 });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (slot) => {
        setEditingId(slot.id);
        setFormData({
            serviceId: slot.serviceId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotsPerHour: slot.slotsPerHour,
            maxDaily: slot.maxDaily,
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'slotsPerHour' || name === 'maxDaily' ? parseInt(value) : value,
        }));
    };

    const timeToMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const checkOverlap = (serviceId, startTime, endTime, excludeId = null) => {
        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);

        return timeSlots.some(slot => {
            if (excludeId && slot.id === excludeId) return false;
            if (slot.serviceId !== serviceId) return false;

            const slotStartMin = timeToMinutes(slot.startTime);
            const slotEndMin = timeToMinutes(slot.endTime);

            // Check for overlap
            return !(endMin <= slotStartMin || startMin >= slotEndMin);
        });
    };

    const handleSave = () => {
        if (!formData.serviceId) {
            toast.error('Please select a service');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            toast.error('End time must be after start time');
            return;
        }

        // Check for overlapping time slots for the same service
        if (checkOverlap(formData.serviceId, formData.startTime, formData.endTime, editingId)) {
            toast.error('Time slot overlaps with existing slot for this service');
            return;
        }

        const hours = calculateHours(formData.startTime, formData.endTime);
        const calculatedMaxDaily = Math.ceil(hours * formData.slotsPerHour);

        if (formData.maxDaily < calculatedMaxDaily) {
            toast.error(`Maximum daily appointments must be at least ${calculatedMaxDaily} (${hours}h × ${formData.slotsPerHour} slots/hour)`);
            return;
        }

        if (editingId) {
            setTimeSlots(prev => prev.map(slot =>
                slot.id === editingId ? { id: editingId, ...formData } : slot
            ));
            toast.success('Time slot updated successfully');
        } else {
            setTimeSlots(prev => [...prev, { id: Date.now(), ...formData }]);
            toast.success('Time slot created successfully');
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        setTimeSlots(prev => prev.filter(slot => slot.id !== id));
        toast.success('Time slot deleted');
    };

    const getServiceName = (serviceId) => {
        return services.find(s => s.id === serviceId)?.name || serviceId;
    };

    const calculateHours = (startTime, endTime) => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        return Math.round(diffMinutes / 60 * 10) / 10;
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Time Slot Management</h1>
                    <p className="text-muted-foreground">Configure available appointment slots for each service</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Time Slot
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Service Time Slots
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Slots/Hour</TableHead>
                                <TableHead>Max Daily</TableHead>
                                <TableHead>Calculated Capacity</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {timeSlots.map(slot => {
                                const hours = calculateHours(slot.startTime, slot.endTime);
                                const capacity = Math.floor(hours * slot.slotsPerHour);
                                return (
                                    <TableRow key={slot.id}>
                                        <TableCell className="font-medium">{getServiceName(slot.serviceId)}</TableCell>
                                        <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                                        <TableCell><Badge variant="outline">{slot.slotsPerHour}</Badge></TableCell>
                                        <TableCell><Badge className="bg-primary/10 text-primary">{slot.maxDaily}</Badge></TableCell>
                                        <TableCell>{Math.min(capacity, slot.maxDaily)} slots</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenEdit(slot)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(slot.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b sticky top-0 bg-card">
                            <CardTitle>{editingId ? 'Edit Time Slot' : 'Create Time Slot'}</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(false)} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <Label htmlFor="service">Service *</Label>
                                    <select
                                        id="service"
                                        name="serviceId"
                                        value={formData.serviceId}
                                        onChange={handleInputChange}
                                        className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">Select service</option>
                                        {services.map(svc => (
                                            <option key={svc.id} value={svc.id}>{svc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Working Hours</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="bg-input"
                                        />
                                        <Input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="bg-input"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-2">
                                    <Label htmlFor="slotsPerHour">Slots Per Hour</Label>
                                    <Input
                                        id="slotsPerHour"
                                        name="slotsPerHour"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.slotsPerHour}
                                        onChange={handleInputChange}
                                        className="bg-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxDaily">Maximum Daily Slots</Label>
                                    <Input
                                        id="maxDaily"
                                        name="maxDaily"
                                        type="number"
                                        min="1"
                                        value={formData.maxDaily}
                                        onChange={handleInputChange}
                                        className="bg-input"
                                    />
                                </div>
                            </div>

                            <div className="bg-muted p-4 rounded-lg mb-6">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Calculated Capacity:</strong> With {formData.slotsPerHour} slots per hour and maximum daily cap of {formData.maxDaily}, this service can handle up to {formData.maxDaily} appointments per day.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="flex-1 gap-2">
                                    <Save className="h-4 w-4" />
                                    {editingId ? 'Update' : 'Create'} Slot
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );

}