import { ApplicationsList } from "@/components/applications-list";

export default function Page() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Applications</h1>
                <p className="text-gray-600 mt-2">Track and manage your internship and job applications</p>
            </div>
            <ApplicationsList />
        </div>
    );
}