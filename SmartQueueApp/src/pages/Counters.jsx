import { useState } from 'react';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/AlertDialog';

import {
    getAllCounters,
    addCounter,
    updateCounter,
    deleteCounter,
    getAllServices,
} from '@/lib/api';

const emptyFormData = {
    name: '',
    serviceId: '',
    officer: '',
};

export default function CountersPage() {
    const queryClient = useQueryClient();
    const { data: counters = [] } = useQuery({
        queryKey: ['counters'],
        queryFn: getAllCounters,
    });
    const { data: services = [] } = useQuery({
        queryKey: ['services'],
        queryFn: getAllServices,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [selectedCounter, setSelectedCounter] = useState(null);
    const [formData, setFormData] = useState(emptyFormData);

    const invalidateCounters = () =>
        queryClient.invalidateQueries({ queryKey: ['counters'] });

    const createMutation = useMutation({
        mutationFn: addCounter,
        onSuccess: (newCounter) => {
            invalidateCounters();
            toast.success(`Counter "${newCounter.counterName}" created successfully`);
            setIsModalOpen(false);
            setFormData(emptyFormData);
        },
        onError: (error) => toast.error(error.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => updateCounter(id, payload),
        onSuccess: () => {
            invalidateCounters();
            toast.success('Counter updated successfully');
            setIsModalOpen(false);
            setFormData(emptyFormData);
        },
        onError: (error) => toast.error(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCounter,
        onSuccess: () => {
            invalidateCounters();
            toast.success(`Counter "${selectedCounter.counterName}" deleted successfully`);
            setIsDeleteConfirm(false);
            setSelectedCounter(null);
        },
        onError: (error) => toast.error(error.message),
    });

    const handleOpenCreate = () => {
        setSelectedCounter(null);
        setFormData(emptyFormData);
        setIsModalOpen(true);
    }

    const handleOpenEdit = (counter) => {
        setSelectedCounter(counter);
        setFormData({
            name: counter.counterName,
            serviceId: counter.service?.serviceId ?? '',
            officer: counter.officer?.officerName ?? '',
        });
        setIsModalOpen(true);
    }

    const nextCounterNumber = () => {
        const maxNum = counters.reduce((max, c) => {
            const match = /^C-(\d{2,})$/.exec(c.counterNumber ?? '');
            return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);
        return `C-${String(maxNum + 1).padStart(2, '0')}`;
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            toast.error("Counter name is required");
            return;
        }
        if (!formData.serviceId) {
            toast.error("Service is required");
            return;
        }

        const service = services.find((s) => s._id === formData.serviceId);
        const payload = {
            counterName: formData.name,
            service: { serviceId: service._id, serviceName: service.name },
            ...(formData.officer.trim() && { officer: { officerName: formData.officer.trim() } }),
        };

        if (selectedCounter) {
            updateMutation.mutate({ id: selectedCounter._id, payload });
        } else {
            createMutation.mutate({ ...payload, counterNumber: nextCounterNumber() });
        }
    }

    const handleDeleteClick = (counter) => {
        setSelectedCounter(counter);
        setIsDeleteConfirm(true);
    }

    const handleConfirmDelete = () => {
        deleteMutation.mutate(selectedCounter._id);
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Counters Management</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create, edit, and manage service counters
                    </p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Counter
                </Button>
            </div>

            {/* Stats Section */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Counters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{counters.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{new Set(counters.map((c) => c.service?.serviceId)).size}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Waiting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{counters.reduce((sum, c) => sum + (c.waitingQueue?.count ?? 0), 0)}</div>
                    </CardContent>
                </Card>
            </div>
            {/* Counters List Section */}
            <Card>
                <CardHeader>
                    <CardTitle>All Counters</CardTitle>
                    <CardDescription>Manage service counters and their assignments</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Counter ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Officer</TableHead>
                                <TableHead>Current Token</TableHead>
                                <TableHead>Waiting</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {counters.map((counter) => (
                                <TableRow key={counter._id}>
                                    <TableCell className="font-mono font-semibold text-primary">{counter.counterNumber}</TableCell>
                                    <TableCell className="font-medium">{counter.counterName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{counter.service?.serviceName}</Badge>
                                    </TableCell>
                                    <TableCell>{counter.officer?.officerName ?? 'Unassigned'}</TableCell>
                                    <TableCell className="font-mono text-muted-foreground">{counter.currentToken?.tokenNumber ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={(counter.waitingQueue?.count ?? 0) > 5 ? 'destructive' : 'secondary'}>
                                            {counter.waitingQueue?.count ?? 0} in queue
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenEdit(counter)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(counter)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {/* Modal for Create/Edit Counter */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle>{selectedCounter ? 'Edit Counter' : 'Add New Counter'}</CardTitle>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-md p-1 hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Counter Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Counter 1, Service Desk A"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="service">Service</Label>
                                <select
                                    id="service"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.serviceId}
                                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                >
                                    <option value="">Select a service</option>
                                    {services.map((svc) => (
                                        <option key={svc._id} value={svc._id}>
                                            {svc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="officer">Assigned Officer (optional)</Label>
                                <Input
                                    id="officer"
                                    placeholder="e.g., John Perera"
                                    value={formData.officer}
                                    onChange={(e) => setFormData({ ...formData, officer: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleSave}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {selectedCounter ? 'Update Counter' : 'Create Counter'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Delete Confirmation Dialog */}
            {isDeleteConfirm && (
                <AlertDialog open={isDeleteConfirm} onOpenChange={setIsDeleteConfirm}>
                    <AlertDialogContent>
                        <AlertDialogTitle>Delete Counter?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{selectedCounter?.counterName}</span>? This action cannot be undone.
                        </AlertDialogDescription>
                        <div className="flex gap-3">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}