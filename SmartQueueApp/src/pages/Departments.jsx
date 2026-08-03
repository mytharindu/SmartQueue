import { useState } from "react";
import { toast } from "sonner";
import { departments as mockDepartments } from "@/lib/mock-departments";
import { Button } from "@/components/ui/Button";
import {
    Plus,
    Edit2,
    Trash2,
    X,
    AlertCircle,
    Mail,
    Phone,
    MapPin,
    User,
} from "lucide-react";
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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const EMOJI_OPTIONS = [
    "🏛️", "🏢", "📝", "📋", "👨‍💼", "📊", "💼", "📚",
    "🏥", "⚕️", "💊", "🚗", "🚙", "🛂", "✈️", "🗺️",
    "💰", "💳", "📈", "🔐", "🛡️", "📱", "💻", "⚙️",
];

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState(mockDepartments);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        description: "",
        location: "",
        email: "",
        phone: "",
        head: "",
        icon: "🏛️",
        isActive: true,
    });
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            id: "",
            name: "",
            description: "",
            location: "",
            email: "",
            phone: "",
            head: "",
            icon: "🏛️",
            isActive: true,
        });
        setIsIconSelectorOpen(false);
    };

    const handleIconSelect = (emoji) => {
        setFormData((prev) => ({
            ...prev,
            icon: emoji,
        }));
        setIsIconSelectorOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.location) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (editingId) {
            setDepartments((prev) =>
                prev.map((dept) =>
                    dept.id === editingId
                        ? {
                            ...dept,
                            ...formData,
                            operatingHours: dept.operatingHours,
                        }
                        : dept
                )
            );
            toast.success("Department updated successfully");
        } else {
            const newId = `DEPT-${String(departments.length + 1).padStart(3, "0")}`;
            setDepartments((prev) => [
                ...prev,
                {
                    ...formData,
                    id: newId,
                    operatingHours: {
                        monday: { open: "8:00 AM", close: "5:00 PM" },
                        tuesday: { open: "8:00 AM", close: "5:00 PM" },
                        wednesday: { open: "8:00 AM", close: "5:00 PM" },
                        thursday: { open: "8:00 AM", close: "5:00 PM" },
                        friday: { open: "8:00 AM", close: "4:00 PM" },
                        saturday: { open: "Closed", close: "Closed" },
                        sunday: { open: "Closed", close: "Closed" },
                    },
                    totalCounters: 0,
                    totalServices: 0,
                },
            ]);
            toast.success("Department created successfully");
        }
        closeModal();
    };

    const handleDelete = (id) => {
        setDepartments((prev) => prev.filter((dept) => dept.id !== id));
        setDeleteConfirm(null);
        toast.success("Department deleted successfully");
    };

    const openEditModal = (department) => {
        setEditingId(department.id);
        setFormData({
            id: department.id,
            name: department.name,
            description: department.description,
            location: department.location,
            email: department.email,
            phone: department.phone,
            head: department.head,
            icon: department.icon,
            isActive: department.isActive,
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Departments</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage government departments and their services
                    </p>
                </div>
                <Button
                    onClick={() => {
                        closeModal();
                        setIsModalOpen(true);
                    }}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Department
                </Button>
            </div>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Departments</p>
                            <p className="text-3xl font-bold text-primary">
                                {departments.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Active</p>
                            <p className="text-3xl font-bold text-green-600">
                                {departments.filter((d) => d.isActive).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Services</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {departments.reduce((sum, d) => sum + d.totalServices, 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Table */}
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>Department List</CardTitle>
                    <CardDescription>
                        All registered government departments
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Head</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.map((department) => (
                                    <TableRow key={department.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{department.icon}</span>
                                                <div>
                                                    <p>{department.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {department.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                {department.location}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {department.head}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {department.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {department.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    department.isActive ? "default" : "secondary"
                                                }
                                            >
                                                {department.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => openEditModal(department)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setDeleteConfirm(department.id)}
                                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                    <Card className="w-full max-w-4xl max-h-[85vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b sticky top-0 bg-card">
                            <CardTitle>
                                {editingId ? "Edit Department" : "Create Department"}
                            </CardTitle>
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
                                {/* Name & Location */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Department Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Department of Immigration"
                                            className="bg-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location *</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Colombo Central"
                                            className="bg-input"
                                        />
                                    </div>
                                </div>

                                {/* Head & Email */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="head">Department Head</Label>
                                        <Input
                                            id="head"
                                            name="head"
                                            value={formData.head}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Dr. K. Perera"
                                            className="bg-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="department@gov.lk"
                                            className="bg-input"
                                        />
                                    </div>
                                </div>

                                {/* Phone & Icon */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+94-11-1234567"
                                            className="bg-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Department Icon</Label>
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

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of the department"
                                        className="h-16 w-full rounded-md border border-input bg-input px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 rounded-md border border-input bg-input px-3 py-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 rounded border-input"
                                        />
                                        <span className="text-sm font-medium">Active Department</span>
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeModal}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">
                                        {editingId ? "Update" : "Create"}
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
                            <CardTitle>Select Department Icon</CardTitle>
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
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )};
            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
                            <div className="flex gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 text-destructive flex-shrink-0" />
                                <CardTitle>Delete Department?</CardTitle>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirm(null)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone. The department will be permanently deleted.
                            </p>
                            <div className="mt-6 flex gap-3">
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
        </div>
    );
}