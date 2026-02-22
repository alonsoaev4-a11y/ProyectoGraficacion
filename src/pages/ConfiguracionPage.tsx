import { useState, useEffect } from 'react';
import { useWizard } from '@/components/wizard/WizardProvider';
import { WIZARD_CONFIGS } from '@/config/wizardSteps';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Shield, Palette, Bell, Lock, Key, Camera, Check, Download, Trash2, Copy } from 'lucide-react';
import { useSimulatedAuth } from '@/hooks/useSimulatedAuth';

const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'cuenta', label: 'Cuenta', icon: Shield },
    { id: 'apariencia', label: 'Apariencia', icon: Palette },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'seguridad', label: 'Seguridad', icon: Lock },
    { id: 'api', label: 'API Keys', icon: Key }
];

const ConfiguracionInner = () => {
    const { loadModule } = useWizard();
    const [activeTab, setActiveTab] = useState('perfil');
    const { user } = useSimulatedAuth();

    useEffect(() => {
        loadModule(WIZARD_CONFIGS.configuracion);
    }, []);

    const renderTabContent = (tabId: string) => {
        switch (tabId) {
            case 'perfil':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Columna 1: Avatar y nombre */}
                        <div className="col-span-1">
                            <div className="cyber-card p-6 text-center bg-white border border-gray-200 shadow-sm">
                                <div className="relative inline-block mb-4">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-4xl text-white font-bold border-4 border-white shadow-lg">
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                    <button
                                        data-wizard-target="cambiar-avatar"
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-[var(--accent-cyan)] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg border-2 border-white"
                                    >
                                        <Camera className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{user?.name || 'Usuario'}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Desarrollador Full Stack</p>
                                <p className="text-xs text-[var(--accent-cyan)] mt-2 font-medium bg-[var(--accent-cyan)]/10 py-1 px-3 rounded-full inline-block">
                                    Miembro desde Feb 2026
                                </p>
                            </div>
                        </div>

                        {/* Columna 2-3: Formulario */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="cyber-card p-6 bg-white border border-gray-200">
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-[var(--accent-cyan)]" />
                                    Información Personal
                                </h3>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div data-wizard-target="campo-nombre">
                                            <label className="block text-sm text-[var(--text-secondary)] mb-2">Nombre Completo</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.name || ''}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]/50 transition-all"
                                            />
                                        </div>
                                        <div data-wizard-target="campo-username">
                                            <label className="block text-sm text-[var(--text-secondary)] mb-2">Nombre de Usuario</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.name?.toLowerCase().replace(/\s/g, '') || ''}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div data-wizard-target="campo-email">
                                        <label className="block text-sm text-[var(--text-secondary)] mb-2">Email</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email || ''}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]/50 transition-all"
                                        />
                                    </div>

                                    <div data-wizard-target="campo-bio">
                                        <label className="block text-sm text-[var(--text-secondary)] mb-2">Biografía</label>
                                        <textarea
                                            rows={4}
                                            defaultValue="Full-stack developer apasionado por la automatización y el diseño de software."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]/50 transition-all resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" className="px-6 py-2.5 bg-[var(--accent-cyan)] text-white font-bold rounded-lg hover:bg-[var(--accent-cyan)]/90 transition-all shadow-lg shadow-cyan-500/20">
                                            💾 Guardar Cambios
                                        </button>
                                        <button type="button" className="px-6 py-2.5 border border-gray-200 text-[var(--text-secondary)] rounded-lg hover:bg-gray-50 transition-all">
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                );
            case 'cuenta':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Plan actual */}
                        <div className="cyber-card p-6 bg-white border border-gray-200" data-wizard-target="plan-actual">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Plan Actual</h3>
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-sm font-bold border border-purple-200">
                                    PRO
                                </span>
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm mb-6">
                                Acceso completo a todas las funcionalidades avanzadas de Herman Platform.
                            </p>
                            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="text-gray-600">Proyectos ilimitados</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="text-gray-600">10 miembros por equipo</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="text-gray-600">Exportación de código</span>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20">
                                ⬆️ Actualizar a Enterprise
                            </button>
                        </div>

                        {/* Uso de recursos */}
                        <div className="cyber-card p-6 bg-white border border-gray-200" data-wizard-target="uso-recursos">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Uso de Recursos</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-[var(--text-secondary)]">Proyectos Activos</span>
                                        <span className="text-[var(--text-primary)]">12 / ∞</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-400 to-green-400" style={{ width: '12%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-[var(--text-secondary)]">Almacenamiento</span>
                                        <span className="text-[var(--text-primary)]">4.2 GB / 50 GB</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-400 to-green-400" style={{ width: '8.4%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-[var(--text-secondary)]">Generaciones de código</span>
                                        <span className="text-[var(--text-primary)]">89 / 1000</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-400 to-green-400" style={{ width: '8.9%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Zona peligrosa */}
                        <div className="col-span-1 md:col-span-2 cyber-card p-6 border-red-200 bg-red-50" data-wizard-target="zona-peligrosa">
                            <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                                ⚠️ Zona Peligrosa
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="flex-1 flex items-center justify-between p-4 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-all group shadow-sm">
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-red-700 group-hover:text-red-800">Exportar Datos</p>
                                        <p className="text-xs text-red-500">Descarga todos tus proyectos</p>
                                    </div>
                                    <Download className="w-5 h-5 text-red-400" />
                                </button>
                                <button className="flex-1 flex items-center justify-between p-4 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-all group shadow-sm">
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-red-700 group-hover:text-red-800">Eliminar Cuenta</p>
                                        <p className="text-xs text-red-500">Acción permanente e irreversible</p>
                                    </div>
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'api':
                return (
                    <div className="space-y-6">
                        <div className="cyber-card p-6 bg-white border border-gray-200" data-wizard-target="crear-api-key">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Crear Nueva API Key</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Nombre de la key (ej: Servidor Producción)"
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors"
                                />
                                <button className="px-6 py-2.5 bg-[var(--accent-cyan)] text-white font-bold rounded-lg hover:bg-[var(--accent-cyan)]/90 transition-all flex items-center gap-2 shadow-sm">
                                    <Plus className="w-4 h-4" /> Generar Key
                                </button>
                            </div>
                        </div>

                        {/* Lista de API Keys */}
                        <div className="cyber-card p-6 bg-white border border-gray-200" data-wizard-target="lista-api-keys">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Tus API Keys Activas</h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Producción', key: 'hm_prod_7kx9...', created: '10 Feb 2026', lastUsed: 'Hace 2 horas' },
                                    { name: 'Desarrollo', key: 'hm_dev_3mq2...', created: '05 Feb 2026', lastUsed: 'Hace 1 día' },
                                ].map((apiKey, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[var(--accent-cyan)] transition-colors group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-1.5 rounded-lg bg-[var(--accent-cyan)]/10">
                                                    <Key className="w-4 h-4 text-[var(--accent-cyan)]" />
                                                </div>
                                                <span className="font-bold text-[var(--text-primary)]">{apiKey.name}</span>
                                            </div>
                                            <code className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border border-gray-200 block w-fit mb-2">
                                                {apiKey.key}
                                            </code>
                                            <div className="flex gap-4 text-xs text-gray-400">
                                                <span>Creada: {apiKey.created}</span>
                                                <span className="text-[var(--accent-cyan)]/70">•</span>
                                                <span>Último uso: {apiKey.lastUsed}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-15.0 relative group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-2 hover:bg-[var(--accent-cyan)]/10 rounded-lg transition-colors text-gray-400 hover:text-[var(--accent-cyan)]"
                                                title="Copiar Key"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                                title="Revocar Key"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default: {
                const currentTab = tabs.find(t => t.id === tabId);
                const TabIcon = currentTab?.icon;
                return (
                    <div className="flex flex-col items-center justify-center p-20 text-center cyber-card bg-white border border-gray-200">
                        <div className="p-4 rounded-full bg-gray-100 mb-4 animate-pulse">
                            {TabIcon &&
                                <TabIcon className="w-12 h-12 text-gray-400" />
                            }
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Sección en Construcción</h3>
                        <p className="text-[var(--text-secondary)]">Estamos trabajando en las opciones de {currentTab?.label}.</p>
                    </div>
                );
            }
        }
    };

    return (
        <div className="configuracion-container min-h-screen">
            {/* Header con Wizard Button */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="section-header text-3xl font-bold text-[var(--text-primary)] mb-2">Configuración</h1>
                    <p className="text-[var(--text-secondary)]">Personaliza tu experiencia en Herman Platform</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-8 border-b border-cyan-500/20 overflow-x-auto pb-1 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-6 py-3 border-b-2 transition-all whitespace-nowrap text-sm font-medium
                            ${activeTab === tab.id
                                ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-50'
                            }
                        `}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[var(--accent-cyan)]' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderTabContent(activeTab)}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Import necessary Plus icon for the API tab
function Plus({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}

export default function ConfiguracionPage() {
    return (
        <ConfiguracionInner />
    );
}
