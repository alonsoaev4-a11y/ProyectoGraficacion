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
        <div className="flex h-screen bg-[#0a0a12] text-[#e0e0e8] font-sans overflow-hidden">
            <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Background Grid */}
                <div className="dashboard-main absolute inset-0 z-0 pointer-events-none bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                <TopBar onNewProject={onNewProject || (() => { })} />

                <main className="flex-1 overflow-auto relative z-10 p-6 lg:p-8">
                    {children}
                </main>
            </div>


        </div>
    );
};
