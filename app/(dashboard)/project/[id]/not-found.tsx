import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ProjectNotFound() {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Project Not Found</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
                    This project doesn't exist or you don't have access to it.
                </p>
                <Link href="/dashboard" className="mt-6">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </CardContent>
        </Card>
    );
}

