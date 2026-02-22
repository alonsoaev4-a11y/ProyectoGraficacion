import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

import '@/styles/dashboard.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeModule: string;
    setActiveModule: (module: string) => void;
    onNewProject?: () => void;
}

export const DashboardLayout = ({ children, activeModule, setActiveModule, onNewProject }: DashboardLayoutProps) => {
    return (
        <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden">
            <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Background Grid */}
                <div className="dashboard-main absolute inset-0 z-0 pointer-events-none" />

                <TopBar onNewProject={onNewProject || (() => { })} />

                <main className="flex-1 overflow-auto relative z-10 p-6 lg:p-8">
                    {children}
                </main>
            </div>


        </div>
    );
};
