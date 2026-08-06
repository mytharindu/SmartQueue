import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/AuthContext";
import { getAllUsers, updateUserRole } from "@/lib/api";

const ROLES = ["counter-staff", "supervisor", "manager", "admin"];

export default function StaffPage() {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getAllUsers });

    const roleMutation = useMutation({
        mutationFn: ({ id, role }) => updateUserRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Role updated");
        },
        onError: (error) => toast.error(error.message),
    });

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Staff accounts</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Assign roles to registered staff accounts
                </p>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 border-b">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle>Registered accounts</CardTitle>
                        <CardDescription>{users.length} accounts</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium">
                                        {u.username}
                                        {u.id === currentUser?.id && (
                                            <Badge variant="secondary" className="ml-2 text-[10px]">You</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <select
                                            value={u.role}
                                            onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                                            disabled={roleMutation.isPending}
                                            className="rounded-md border border-input bg-input px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            {ROLES.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.isActive ? "default" : "secondary"}>
                                            {u.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
