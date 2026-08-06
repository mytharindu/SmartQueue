import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const user = await login(username, password);
            toast.success(`Welcome back, ${user.username}`);
            navigate(location.state?.from?.pathname ?? "/officer", { replace: true });
        } catch (error) {
            toast.error("Login failed", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center p-6 md:p-8">
            <Card className="p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero shadow-glow">
                        <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Staff sign in</h1>
                        <p className="text-xs text-muted-foreground">Officer &amp; admin tools</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in…" : "Sign in"}
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Need an account?{" "}
                    <Link to="/register" className="font-medium text-primary hover:underline">
                        Register
                    </Link>
                </p>
            </Card>
        </div>
    );
}
