import { listProjects } from "@/actions/projects";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardPage() {
    const projects = await listProjects();

    return <DashboardContent projects={projects} />;
}
