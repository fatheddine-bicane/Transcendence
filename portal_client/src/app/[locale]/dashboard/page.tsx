import { RequireAccess } from '@/components/Auth/RequireAccess';

function Dashboard() {
    return (
        <RequireAccess>
            <main>
                <h1>Dashboard</h1>
            </main>
        </RequireAccess>
    );
}

export default Dashboard;
