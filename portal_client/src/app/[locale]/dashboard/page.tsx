import { SilentRefresh } from '@/components/Auth/SilentRefresh';
import { getValidAccessToken } from '@/lib/api/auth';

async function Dashboard() {
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
        return <SilentRefresh />;
    }

    return (
        <main>
            <h1>Dashboard</h1>
        </main>
    );
}

export default Dashboard;
