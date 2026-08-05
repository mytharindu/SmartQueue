import { useState } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    X,
    AlertCircle,
    Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/Card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

import {
    getAllServices,
    addService,
    updateService,
    deleteService,
    getAllDepartments,
} from "@/lib/api";

const EMOJI_OPTIONS = [
    "📋", "📝", "🏛️", "🏢", "🏛", "👨‍💼", "📊", "💼", "🎓", "📚",
    "🏥", "⚕️", "💊", "🚗", "🚙", "🛂", "✈️", "🏠", "🗺️", "📍",
    "💰", "💳", "📈", "🔐", "🛡️", "📱", "💻", "⚙️", "🔧", "🎫",
    "📞", "✉️", "📧", "🖨️", "📄", "🗂️", "📌", "📎", "✅", "⭐",
    "🎖️", "🏆", "🔔", "📢", "📣", "⚡", "🌟", "💡", "🎯", "🎪",
];

const emptyFormData = {
    name: "",
    office: "",
    departmentId: "",
    duration: 30,
    icon: "📋",
    docs: [],
};

export default function ServicesPage() {
    const queryClient = useQueryClient();
    const { data: services = [] } = useQuery({
        queryKey: ["services"],
        queryFn: getAllServices,
    });
    const { data: departments = [] } = useQuery({
        queryKey: ["departments"],
        queryFn: getAllDepartments,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(emptyFormData);
    const [docInput, setDocInput] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const invalidateServices = () =>
        queryClient.invalidateQueries({ queryKey: ["services"] });

    const createMutation = useMutation({
        mutationFn: addService,
        onSuccess: () => {
            invalidateServices();
            toast.success("Service added successfully.");
            closeModal();
        },
        onError: (error) => toast.error(error.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => updateService(id, payload),
        onSuccess: () => {
            invalidateServices();
            toast.success("Service updated successfully.");
            closeModal();
        },
        onError: (error) => toast.error(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteService,
        onSuccess: () => {
            invalidateServices();
            toast.success("Service deleted successfully.");
            setDeleteConfirm(null);
        },
        onError: (error) => toast.error(error.message),
    });

    // Model handlers
    const openModal = (service = null) => {
        if (service) {
            setEditingId(service._id);
            setFormData({
                name: service.name,
                office: service.office,
                departmentId: service.department?.departmentId ?? "",
                duration: service.duration,
                icon: service.icon,
                docs: [...(service.docs ?? [])],
            });
        } else {
            setEditingId(null);
            setFormData(emptyFormData);
        }
        setDocInput("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(emptyFormData);
        setDocInput("");
    };

    const handleIconSelect = (emoji) => {
        setFormData((prev) => ({
            ...prev,
            icon: emoji,
        }));
        setIsIconSelectorOpen(false);
    };

    //form handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev, [name]: name === "duration" ? parseInt(value) || 30 : value,
        }));
    };

    const handleAddDoc = () => {
        if (docInput.trim() && !formData.docs.includes(docInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                docs: [...prev.docs, docInput.trim()],
            }));
            setDocInput("");
        }
    };

    const handleRemoveDoc = (doc) => {
        setFormData((prev) => ({
            ...prev,
            docs: prev.docs.filter((d) => d !== doc),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.office.trim()) {
            toast.error("Service name and Office are required.");
            return;
        }
        if (!formData.departmentId) {
            toast.error("Department is required.");
            return;
        }

        const department = departments.find((d) => d._id === formData.departmentId);
        const payload = {
            name: formData.name,
            office: formData.office,
            duration: formData.duration,
            icon: formData.icon,
            docs: formData.docs,
            department: {
                departmentId: department._id,
                departmentName: department.name,
            },
        };

        if (editingId) {
            updateMutation.mutate({ id: editingId, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="text-3xl font-bold">Services Management</h1>
                <p className="mt-1 text-muted-foreground">
                    Create and manage government services offered at this office
                </p>
            </div>
            <Button onClick={() => openModal()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Service
            </Button>

            {/* Services Table */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="text-base">All Services</CardTitle>
                    <CardDescription>{services.length} services available</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Office</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="text-right">Duration</TableHead>
                                    <TableHead>Required Documents</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.map((service) => (
                                    <TableRow key={service._id}>
                                        <TableCell className="font-medium">
                                            <span className="mr-2">{service.icon}</span>
                                            {service.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {service.office}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {service.department?.departmentName}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1 font-mono text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                {service.duration}m
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {(service.docs ?? []).slice(0, 2).map((doc) => (
                                                    <Badge
                                                        key={doc}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {doc}
                                                    </Badge>
                                                ))}
                                                {(service.docs?.length ?? 0) > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{service.docs.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => openModal(service)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit2 className="h-4 w-4 text-primary" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setDeleteConfirm(service._id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {/* Create/Edit Modal */}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
                            <div>
                                <CardTitle>
                                    {editingId ? "Edit Service" : "Create New Service"}
                                </CardTitle>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={closeModal}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Service Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Service Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Passport Application"
                                        className="bg-input"
                                    />
                                </div>

                                {/* Office Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="office">Office Name *</Label>
                                    <Input
                                        id="office"
                                        name="office"
                                        value={formData.office}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Department of Immigration"
                                        className="bg-input"
                                    />
                                </div>

                                {/* Department */}
                                <div className="space-y-2">
                                    <Label htmlFor="departmentId">Department *</Label>
                                    <select
                                        id="departmentId"
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleInputChange}
                                        className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="">Select a department</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Duration & Icon Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                        <Input
                                            id="duration"
                                            name="duration"
                                            type="number"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="240"
                                            className="bg-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Service Icon</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsIconSelectorOpen(true)}
                                            className="w-full justify-start"
                                        >
                                            <span className="mr-2 text-lg">{formData.icon}</span>
                                            Select Icon
                                        </Button>
                                    </div>
                                </div>

                                {/* Required Documents */}
                                <div className="space-y-3">
                                    <Label>Required Documents</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={docInput}
                                            onChange={(e) => setDocInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddDoc();
                                                }
                                            }}
                                            placeholder="Add document type..."
                                            className="bg-input"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddDoc}
                                            variant="outline"
                                            className="px-3"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Document Tags */}
                                    {formData.docs.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.docs.map((doc) => (
                                                <Badge
                                                    key={doc}
                                                    variant="secondary"
                                                    className="flex items-center gap-2 pr-1"
                                                >
                                                    {doc}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDoc(doc)}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                    >
                                        {editingId ? "Update Service" : "Create Service"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeModal}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Emoji Selector Modal */}
            {isIconSelectorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
                            <CardTitle>Select Service Icon</CardTitle>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsIconSelectorOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-8 gap-2">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleIconSelect(emoji)}
                                        className={cn(
                                            "flex h-12 items-center justify-center rounded-lg border-2 text-2xl transition-all hover:scale-110",
                                            formData.icon === emoji
                                                ? "border-primary bg-primary/10 scale-125"
                                                : "border-border hover:border-primary/50"
                                        )}
                                        title={emoji}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader className="border-b">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                                <div>
                                    <CardTitle>Delete Service?</CardTitle>
                                    <CardDescription className="mt-1">
                                        This action cannot be undone. The service will be permanently deleted.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1"
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

        </div >
    );
}