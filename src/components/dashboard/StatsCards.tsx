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
        color: 'from-blue-400 to-cyan-400'
    },
    {
        id: 2,
        label: 'Tiempo Ahorrado',
        value: '124h',
        trend: '+15%',
        icon: Clock,
        progress: 60,
        color: 'from-purple-400 to-pink-400'
    },
    {
        id: 3,
        label: 'Modelos de Datos',
        value: '45',
        trend: '+5',
        icon: Database,
        progress: 45,
        color: 'from-amber-400 to-orange-400'
    },
    {
        id: 4,
        label: 'APIs Generadas',
        value: '89',
        trend: '+12',
        icon: Server,
        progress: 90,
        color: 'from-emerald-400 to-green-400'
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
                    className="dashboard-card p-5 group cursor-pointer relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 opacity-80 group-hover:opacity-100 transition-opacity`}>
                            <stat.icon className="w-6 h-6 text-[var(--accent-cyan)]" />
                        </div>
                        <span className="text-xs font-medium text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 px-2 py-1 rounded">
                            {stat.trend}
                        </span>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1 group-hover:scale-105 transition-transform origin-left">
                            {stat.value}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden relative z-10">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${stat.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                    </div>

                    {/* Background Glow Effect */}
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
                </motion.div>
            ))}
        </div>
    );
};
