import { motion } from 'framer-motion';
import { Activity, Clock, Database, Server } from 'lucide-react';

const stats = [
    {
        id: 1,
        label: 'Proyectos Activos',
        value: '12',
        trend: '+2.5%',
        icon: Activity,
        progress: 75,
        color: 'from-[#00ffff] to-[#00ff88]'
    },
    {
        id: 2,
        label: 'Tiempo Ahorrado',
        value: '124h',
        trend: '+15%',
        icon: Clock,
        progress: 60,
        color: 'from-[#9d22e6] to-[#ff003c]'
    },
    {
        id: 3,
        label: 'Modelos de Datos',
        value: '45',
        trend: '+5',
        icon: Database,
        progress: 45,
        color: 'from-[#ffaa00] to-[#ff003c]'
    },
    {
        id: 4,
        label: 'APIs Generadas',
        value: '89',
        trend: '+12',
        icon: Server,
        progress: 90,
        color: 'from-[#00ff88] to-[#00ffff]'
    }
];

export const StatsCards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="dashboard-card p-5 group cursor-pointer relative overflow-hidden bg-[rgba(10,10,18,0.6)] border border-[rgba(0,171,191,0.3)] shadow-[inset_0_0_15px_rgba(0,171,191,0.05)] hover:border-[#00ffff] hover:shadow-[0_0_20px_rgba(0,171,191,0.3)] transition-all duration-300"
                >
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 opacity-80 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(0,171,191,0.2)]`}>
                            <stat.icon className="w-6 h-6 text-[#e0e0e8]" style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' }} />
                        </div>
                        <span className="text-xs font-bold text-[#00ffff] bg-[rgba(0,171,191,0.1)] border border-[rgba(0,171,191,0.3)] px-2 py-1 rounded shadow-[inset_0_0_5px_rgba(0,171,191,0.2)]" style={{ textShadow: '0 0 5px rgba(0,171,191,0.5)' }}>
                            {stat.trend}
                        </span>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-[#e0e0e8] mb-1 group-hover:scale-105 transition-transform origin-left" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                            {stat.value}
                        </h3>
                        <p className="text-sm text-[#a0a0b0]">{stat.label}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-1 bg-[rgba(0,171,191,0.1)] rounded-full overflow-hidden relative z-10 border border-[rgba(0,171,191,0.2)]">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${stat.color} shadow-[0_0_10px_rgba(0,171,191,0.5)]`}
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                    </div>

                    {/* Background Glow Effect */}
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-30 transition-opacity duration-500`} />
                </motion.div>
            ))}
        </div>
    );
};
