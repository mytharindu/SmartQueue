import { useState } from 'react';
import { timeSlots as mockTimeSlots } from '@/lib/mock-settings';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Edit2, X, Settings, Save } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { counters as initialCounters } from '@/lib/mock-data';

const mockCounterSettings = [
    { id: 'C-01', maxAppointments: 25, dailyTarget: 20, peakHourCapacity: 5 },
    { id: 'C-02', maxAppointments: 30, dailyTarget: 25, peakHourCapacity: 6 },
    { id: 'C-03', maxAppointments: 20, dailyTarget: 18, peakHourCapacity: 4 },
    { id: 'C-04', maxAppointments: 28, dailyTarget: 22, peakHourCapacity: 5 },
];

export default function CounterSettingsPage() {
    const [counterSettings, setCounterSettings] = useState(mockCounterSettings);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        counterId: '',
        maxAppointments: 25,
        dailyTarget: 20,
        peakHourCapacity: 5,
    });

    const handleOpenEdit = (setting) => {
        setEditingId(setting.id);
        setFormData({
            counterId: setting.id,
            maxAppointments: setting.maxAppointments,
            dailyTarget: setting.dailyTarget,
            peakHourCapacity: setting.peakHourCapacity,
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'counterId' ? value : parseInt(value),
        }));
    };

    const getMaxTimeSlotCapacity = () => {
        return mockTimeSlots.reduce((max, slot) => Math.max(max, slot.maxDaily), 0);
    };

    const handleSave = () => {
        if (formData.dailyTarget > formData.maxAppointments) {
            toast.error('Daily target cannot exceed maximum appointments');
            return;
        }

        if (formData.peakHourCapacity > formData.maxAppointments) {
            toast.error('Peak hour capacity cannot exceed maximum appointments');
            return;
        }

        // Validate against time slot capacity
        const maxTimeSlotCapacity = getMaxTimeSlotCapacity();
        if (formData.maxAppointments > maxTimeSlotCapacity) {
            toast.error(`Maximum appointments cannot exceed time slot capacity (${maxTimeSlotCapacity})`);
            return;
        }

        setCounterSettings(prev => prev.map(setting =>
            setting.id === editingId
                ? { id: editingId, maxAppointments: formData.maxAppointments, dailyTarget: formData.dailyTarget, peakHourCapacity: formData.peakHourCapacity }
                : setting
        ));
        toast.success('Counter settings updated successfully');
        setIsModalOpen(false);
    };

    const getCounterDetails = (counterId) => {
        return initialCounters.find(c => c.id === counterId);
    };

    // const getServiceName = (serviceName) => {
    //     return services.find(s => s.name === serviceName)?.name || serviceName;
    // };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Counter Appointment Settings</h1>
                    <p className="text-muted-foreground">Manage maximum appointments and capacity for each counter</p>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Counters</div>
                        <div className="text-2xl font-bold">{counterSettings.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Avg Max Appointments</div>
                        <div className="text-2xl font-bold">
                            {Math.round(counterSettings.reduce((sum, s) => sum + s.maxAppointments, 0) / counterSettings.length)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Daily Capacity</div>
                        <div className="text-2xl font-bold">
                            {counterSettings.reduce((sum, s) => sum + s.dailyTarget, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Peak Hour Total</div>
                        <div className="text-2xl font-bold">
                            {counterSettings.reduce((sum, s) => sum + s.peakHourCapacity, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Counter Capacity Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Counter</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Officer</TableHead>
                                <TableHead>Max Appointments</TableHead>
                                <TableHead>Daily Target</TableHead>
                                <TableHead>Peak Hour Cap</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {counterSettings.map(setting => {
                                const counter = getCounterDetails(setting.id);
                                return (
                                    <TableRow key={setting.id}>
                                        <TableCell className="font-medium">{counter?.name}</TableCell>
                                        <TableCell>{counter?.service}</TableCell>
                                        <TableCell>{counter?.officer}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-primary/10 text-primary">{setting.maxAppointments}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{setting.dailyTarget}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{setting.peakHourCapacity}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(setting)}
                                                className="gap-1"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                Edit
                                            </Button>
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
                            <CardTitle>Edit Counter Settings</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(false)} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="bg-muted p-3 rounded-lg mb-4 text-sm">
                                <p className="font-medium text-foreground">{getCounterDetails(editingId)?.name}</p>
                                <p className="text-muted-foreground">{getCounterDetails(editingId)?.service}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="space-y-2">
                                    <Label htmlFor="maxAppointments">Max Daily Appointments</Label>
                                    <Input
                                        id="maxAppointments"
                                        name="maxAppointments"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.maxAppointments}
                                        onChange={handleInputChange}
                                        className="bg-input"
                                    />
                                    <p className="text-xs text-muted-foreground">Maximum appointments per day</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dailyTarget">Daily Target</Label>
                                    <Input
                                        id="dailyTarget"
                                        name="dailyTarget"
                                        type="number"
                                        min="1"
                                        value={formData.dailyTarget}
                                        onChange={handleInputChange}
                                        className="bg-input"
                                    />
                                    <p className="text-xs text-muted-foreground">Target appointments per day</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="peakHourCapacity">Peak Hour Capacity</Label>
                                    <Input
                                        id="peakHourCapacity"
                                        name="peakHourCapacity"
                                        type="number"
                                        min="1"
                                        value={formData.peakHourCapacity}
                                        onChange={handleInputChange}
                                        className="bg-input"
                                    />
                                    <p className="text-xs text-muted-foreground">Max appointments per hour</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg mb-4">
                                <p className="text-sm text-amber-900 dark:text-amber-100">
                                    <strong>⚠️ Time Slot Limit:</strong> Maximum appointments cannot exceed <strong>{getMaxTimeSlotCapacity()}</strong> (defined in Time Slots configuration)
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6">
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    <strong>Capacity Summary:</strong> This counter can handle up to <strong>{formData.maxAppointments}</strong> appointments daily, with a target of <strong>{formData.dailyTarget}</strong> appointments and <strong>{formData.peakHourCapacity}</strong> appointments during peak hours.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="flex-1 gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );

}