
import {
    Users,
    Clock,
    Calendar,
    Download,
    Filter,
    Search,
    FileText,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ShieldAlert,
    Terminal,
    Database,
    Code2
} from 'lucide-react';
import { useState } from 'react';

// Mock Data for Audit Logs
const auditLogs = [
    {
        id: 1,
        user: {
            name: 'Carlos Rodriguez',
            role: 'Admin',
            avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=0D8ABC&color=fff'
        },
        action: 'Generación de Código',
        description: 'Se generó el módulo de autenticación completo',
        entity: 'Auth Module',
        timestamp: 'Hace 10 min',
        date: '15 Feb 2026, 14:30',
        status: 'success',
        type: 'system'
    },
    {
        id: 2,
        user: {
            name: 'Ana García',
            role: 'Developer',
            avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=6366f1&color=fff'
        },
        action: 'Actualización de Schema',
        description: 'Modificación en la tabla de Usuarios: campo "phone" agregado',
        entity: 'Database',
        timestamp: 'Hace 45 min',
        date: '15 Feb 2026, 13:45',
        status: 'warning',
        type: 'database'
    },
    {
        id: 3,
        user: {
            name: 'Miguel Ángel',
            role: 'Architect',
            avatar: 'https://ui-avatars.com/api/?name=Miguel+Angel&background=10b981&color=fff'
        },
        action: 'Requisitos Aprobados',
        description: 'Se aprobaron los requisitos funcionales del sprint 1',
        entity: 'Requirements',
        timestamp: 'Hace 2 horas',
        date: '15 Feb 2026, 12:15',
        status: 'success',
        type: 'business'
    },
    {
        id: 4,
        user: {
            name: 'Sistema',
            role: 'Bot',
            avatar: 'https://ui-avatars.com/api/?name=System+Bot&background=64748b&color=fff'
        },
        action: 'Error de Despliegue',
        description: 'Fallo en la conexión con el servidor de staging',
        entity: 'Deployment',
        timestamp: 'Hace 5 horas',
        date: '15 Feb 2026, 09:30',
        status: 'error',
        type: 'system'
    },
    {
        id: 5,
        user: {
            name: 'Carlos Rodriguez',
            role: 'Admin',
            avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=0D8ABC&color=fff'
        },
        action: 'Creación de Proyecto',
        description: 'Nuevo proyecto "Sistema de Gestión" inicializado',
        entity: 'Project',
        timestamp: 'Ayer',
        date: '14 Feb 2026, 16:20',
        status: 'success',
        type: 'business'
    }
];

export function RegistroAuditoria() {
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-100 border-green-200';
            case 'warning': return 'text-amber-600 bg-amber-100 border-amber-200';
            case 'error': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-slate-600 bg-slate-100 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle2 size={16} />;
            case 'warning': return <AlertCircle size={16} />;
            case 'error': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'system': return <Terminal size={18} className="text-purple-500" />;
            case 'database': return <Database size={18} className="text-blue-500" />;
            case 'business': return <FileText size={18} className="text-green-500" />;
            default: return <Code2 size={18} className="text-slate-500" />;
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldAlert className="text-purple-600" />
                        Registro de Auditoría
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Historial detallado de cambios, accesos y eventos del sistema
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
                        <Download size={18} />
                        Exportar CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
                        <Calendar size={18} />
                        Últimos 30 días
                        <ChevronDown size={16} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por usuario, acción o entidad..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Filter size={18} className="text-slate-400 mr-2" />
                    {['all', 'system', 'database', 'business'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filterType === type
                                ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500/20'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Acción</th>
                                <th className="px-6 py-4">Contexto</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={log.user.avatar}
                                                alt={log.user.name}
                                                className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm"
                                            />
                                            <div>
                                                <div className="font-medium text-slate-900">{log.user.name}</div>
                                                <div className="text-xs text-slate-500">{log.user.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg">
                                                {getTypeIcon(log.type)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{log.action}</div>
                                                <div className="text-xs text-slate-500 max-w-[200px] truncate">
                                                    {log.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                            {log.entity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-slate-900 font-medium">{log.date.split(',')[0]}</span>
                                            <span className="text-xs text-slate-500">{log.date.split(',')[1]}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                                            {getStatusIcon(log.status)}
                                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                                            <ChevronDown size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/30">
                    <span className="text-sm text-slate-500">
                        Mostrando <span className="font-medium text-slate-900">1-5</span> de <span className="font-medium text-slate-900">24</span> resultados
                    </span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                            Anterior
                        </button>
                        <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
