import { useState, useEffect } from 'react';
import {
  Play,
  Download,
  Package,
  FileCode,
  Terminal,
  Settings,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Loader,
  FolderTree,
  Eye,
  Save,
  RotateCcw,
  AlertTriangle,
  X,
} from 'lucide-react';

interface GenerationConfig {
  framework: 'nextjs' | 'vite' | 'remix';
  language: 'typescript' | 'javascript';
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  database: 'postgresql' | 'mysql' | 'mongodb';
  orm: 'prisma' | 'drizzle' | 'typeorm';
  auth: 'next-auth' | 'clerk' | 'supabase';
  deployment: 'vercel' | 'docker' | 'netlify';
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface GeneradorCodigoProps {
  requirements: any[];
  useCases: any[];
  tables: any[];
  relationships: any[];
  catalogs: any; // Added catalogs prop
}

export function GeneradorCodigo({ requirements, useCases, tables, relationships, catalogs }: GeneradorCodigoProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'console' | 'preview'>('console');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const [config, setConfig] = useState<GenerationConfig>({
    framework: 'nextjs',
    language: 'typescript',
    styling: 'tailwind',
    database: 'postgresql',
    orm: 'prisma',
    auth: 'next-auth',
    deployment: 'vercel',
  });

  const [validationStatus, setValidationStatus] = useState({
    requirements: false,
    useCase: false,
    dataModel: false,
    isValid: false
  });

  const steps = [
    { id: 'init', label: 'Inicializando generador de código' },
    { id: 'analyze', label: 'Analizando requisitos del proyecto' },
    { id: 'structure', label: 'Generando estructura de archivos' },
    { id: 'security', label: 'Configurando Seguridad y RBAC' }, // New Step
    { id: 'frontend', label: 'Configurando frontend' },
    { id: 'backend', label: 'Configurando backend' },
    { id: 'auth', label: 'Implementando autenticación' },
    { id: 'database', label: 'Configurando base de datos' },
    { id: 'tests', label: 'Generando tests unitarios' },
    { id: 'docker', label: 'Creando configuración Docker' },
    { id: 'docs', label: 'Generando documentación' },
  ];

  const presets = [
    {
      id: 't3-stack',
      name: 'T3 Stack (Recomendado)',
      description: 'Next.js, TypeScript, Tailwind, Prisma, NextAuth',
      config: {
        framework: 'nextjs',
        language: 'typescript',
        styling: 'tailwind',
        database: 'postgresql',
        orm: 'prisma',
        auth: 'next-auth',
        deployment: 'vercel',
      }
    },
    {
      id: 'vite-spa',
      name: 'Vite SPA',
      description: 'Vite, React, TypeScript, Tailwind, Supabase',
      config: {
        framework: 'vite',
        language: 'typescript',
        styling: 'tailwind',
        database: 'postgresql',
        orm: 'drizzle',
        auth: 'supabase',
        deployment: 'netlify',
      }
    }
  ];

  useEffect(() => {
    const hasRequirements = requirements && requirements.length > 0;
    const hasUseCase = useCases && useCases.length > 0;
    const hasDataModel = tables && tables.length > 0;

    setValidationStatus({
      requirements: hasRequirements,
      useCase: hasUseCase,
      dataModel: hasDataModel,
      isValid: hasRequirements && hasUseCase && hasDataModel
    });
  }, [requirements, useCases, tables]);

  const handleStartGeneration = () => {
    if (!validationStatus.isValid) {
      alert("Por favor completa todas las secciones antes de generar el código.");
      return;
    }
    setShowConfirmOverwrite(true);
  };

  const confirmGenerate = () => {
    setShowConfirmOverwrite(false);
    setIsGenerating(true);
    setCurrentStep(0);
    setProgress(0);
    setLogs([]);
    setGenerationComplete(false);
  };

  const handleGenerate = handleStartGeneration; // Alias for compatibility

  const handleCancelGeneration = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setIsGenerating(false);
    setCurrentStep(0);
    setProgress(0);
    setLogs(prev => [...prev, { message: 'Generación cancelada por el usuario', type: 'error', timestamp: new Date() }]);
    setShowCancelConfirm(false);
  };

  const handleCancel = confirmCancel; // Alias for compatibility

  useEffect(() => {
    let timer: any;
    const generateStep = async () => {
      if (isGenerating && currentStep < steps.length) {
        const currentLogs: LogEntry[] = [];

        currentLogs.push({
          message: `Completado: ${steps[currentStep].label}`,
          type: 'success',
          timestamp: new Date()
        });

        const stepId = steps[currentStep].id;

        // Simulate specific steps with more detail
        if (stepId === 'analyze') {
          currentLogs.push({ message: '✅ Analizando casos de uso...', type: 'info', timestamp: new Date() });
          await new Promise(r => setTimeout(r, 800));
          setProgress(prev => prev + 5);

          useCases.forEach(uc => {
            currentLogs.push({ message: `   > Procesando caso de uso: ${uc.code} - ${uc.title}`, type: 'info', timestamp: new Date() });
            currentLogs.push({ message: `     - Actores: ${uc.actors.length}`, type: 'info', timestamp: new Date() });
            currentLogs.push({ message: `     - Pasos: ${uc.steps.length}`, type: 'info', timestamp: new Date() });
            if (uc.businessRules?.length > 0) {
              const rules = uc.businessRules.map((r: any) => r.code || r.description || 'RN').join(', ');
              currentLogs.push({ message: `     - Reglas: ${rules}`, type: 'info', timestamp: new Date() });
            }
          });
        }
        else if (stepId === 'security') {
          currentLogs.push({ message: '🛡️ Generando matriz de roles y permisos (RBAC)...', type: 'info', timestamp: new Date() });
          await new Promise(r => setTimeout(r, 1000));

          if (catalogs?.roles?.length) {
            currentLogs.push({ message: `   > Roles de Sistema detectados: ${catalogs.roles.length}`, type: 'success', timestamp: new Date() });
            catalogs.roles.forEach((role: any) => {
              currentLogs.push({ message: `     - Rol: ${role.name} (${role.code})`, type: 'info', timestamp: new Date() });
            });

            // Calculate total permissions based on Actors in UseCases
            let permissionCount = 0;
            useCases.forEach(uc => {
              uc.actors.forEach((actor: any) => {
                if (actor.crudImpact) {
                  Object.values(actor.crudImpact).forEach(val => val && permissionCount++);
                }
              });
            });
            currentLogs.push({ message: `   > Permisos calculados: ${permissionCount}`, type: 'info', timestamp: new Date() });
            currentLogs.push({ message: `   > Generando middleware de autorización...`, type: 'success', timestamp: new Date() });
          } else {
            currentLogs.push({ message: '⚠️ No se detectaron roles configurados. Usando roles por defecto.', type: 'warning', timestamp: new Date() });
          }
        }
        else if (stepId === 'backend') {
          currentLogs.push({ message: '⚙️ Generando controladores y rutas...', type: 'info', timestamp: new Date() });
          await new Promise(r => setTimeout(r, 1000));

          useCases.forEach((uc: any) => { // Cast uc to any to avoid type issues if UseCase interface is not fully aligned yet
            currentLogs.push({ message: `   > Controlador generado: ${uc.title.replace(/\s+/g, '')}Controller.ts`, type: 'info', timestamp: new Date() });
            currentLogs.push({ message: `   > Rutas configuradas para: ${uc.code}`, type: 'info', timestamp: new Date() });
          });
        }

        setLogs(prev => [...prev, ...currentLogs]);

        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setProgress((nextStep / steps.length) * 100);

        if (nextStep === steps.length) {
          setIsGenerating(false);
          setGenerationComplete(true);
          setLogs(prev => [...prev, {
            message: '¡Generación de código completada exitosamente!',
            type: 'success',
            timestamp: new Date()
          }]);
        }
      }
    };

    if (isGenerating && currentStep < steps.length) {
      timer = setTimeout(() => {
        generateStep();
      }, 1500); // Base delay for each step

      return () => clearTimeout(timer);
    }
  }, [isGenerating, currentStep, steps.length, catalogs]); // Added catalogs to dependency

  const applyPreset = (preset: typeof presets[0]) => {
    setConfig(preset.config as GenerationConfig);
  };

  const generatedFiles = [
    { name: 'package.json', path: '/', type: 'json' },
    { name: 'tsconfig.json', path: '/', type: 'json' },
    { name: 'next.config.js', path: '/', type: 'js' },
    { name: 'schema.prisma', path: '/prisma', type: 'prisma' },
    { name: 'rbc-config.ts', path: '/config', type: 'ts' },
    { name: 'auth.ts', path: '/lib', type: 'ts' },
    { name: 'validation.ts', path: '/lib', type: 'ts' }, // New AST file
    { name: 'types.ts', path: '/types', type: 'ts' }, // New AST file
    { name: 'route.ts', path: '/app/api/[usecase]', type: 'ts' },
    { name: 'middleware.ts', path: '/', type: 'ts' },
  ];

  return (
    <div className="space-y-6">
      {/* ... header ... */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Generador de Código</h2>
          <p className="text-slate-600">Configura y genera el código fuente de tu aplicación</p>
        </div>
        {/* ... buttons ... */}
        <div className="flex gap-2">
          {!isGenerating ? (
            <button
              onClick={handleGenerate}
              disabled={!validationStatus.isValid}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${validationStatus.isValid
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              <Play size={20} />
              Generar Código
            </button>
          ) : (
            <button
              onClick={handleCancelGeneration}
              className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-all"
            >
              <XCircle size={20} />
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* ... validation status ... */}
      <div className="grid grid-cols-4 gap-4">
        {/* kept same as original */}
        <div className={`p-4 rounded-xl border ${validationStatus.requirements ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            {validationStatus.requirements ? <CheckCircle2 className="text-green-600" size={20} /> : <AlertTriangle className="text-amber-600" size={20} />}
            <span className={`font-semibold ${validationStatus.requirements ? 'text-green-900' : 'text-amber-900'}`}>Requisitos</span>
          </div>
          <p className={`text-sm ${validationStatus.requirements ? 'text-green-700' : 'text-amber-700'}`}>
            {validationStatus.requirements ? `${requirements.length} requisitos definidos` : 'Faltan definir requisitos'}
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${validationStatus.useCase ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            {validationStatus.useCase ? <CheckCircle2 className="text-green-600" size={20} /> : <AlertTriangle className="text-amber-600" size={20} />}
            <span className={`font-semibold ${validationStatus.useCase ? 'text-green-900' : 'text-amber-900'}`}>Caso de Uso</span>
          </div>
          <p className={`text-sm ${validationStatus.useCase ? 'text-green-700' : 'text-amber-700'}`}>
            {validationStatus.useCase ? 'Caso de uso completado' : 'Faltan pasos en el flujo'}
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${validationStatus.dataModel ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            {validationStatus.dataModel ? <CheckCircle2 className="text-green-600" size={20} /> : <AlertTriangle className="text-amber-600" size={20} />}
            <span className={`font-semibold ${validationStatus.dataModel ? 'text-green-900' : 'text-amber-900'}`}>Modelo de Datos</span>
          </div>
          <p className={`text-sm ${validationStatus.dataModel ? 'text-green-700' : 'text-amber-700'}`}>
            {validationStatus.dataModel ? `${tables.length} tablas definidas` : 'Falta definir tablas'}
          </p>
        </div>
        <div className="p-4 rounded-xl border bg-slate-50 border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-purple-600" size={20} />
            <span className="font-semibold text-slate-900">Estado General</span>
          </div>
          <p className="text-sm text-slate-600">
            {validationStatus.isValid ? 'Listo para generar' : 'Completa los pasos anteriores'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {/* Configuration Section kept same... */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Settings size={20} className="text-purple-600" />
              Configuración del Stack
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {presets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
                >
                  <div className="font-semibold text-slate-900 group-hover:text-purple-700 mb-1">
                    {preset.name}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-2">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
            {/* ... select inputs ... */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Framework</label>
                  <select
                    value={config.framework}
                    onChange={(e) => setConfig({ ...config, framework: e.target.value as any })}
                    className="w-full rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="nextjs">Next.js 14 (App Router)</option>
                    <option value="vite">Vite + React</option>
                    <option value="remix">Remix</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lenguaje</label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value as any })}
                    className="w-full rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Base de Datos</label>
                  <select
                    value={config.database}
                    onChange={(e) => setConfig({ ...config, database: e.target.value as any })}
                    className="w-full rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estilos</label>
                  <select
                    value={config.styling}
                    onChange={(e) => setConfig({ ...config, styling: e.target.value as any })}
                    className="w-full rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="tailwind">Tailwind CSS</option>
                    <option value="css-modules">CSS Modules</option>
                    <option value="styled-components">Styled Components</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ORM</label>
                  <select
                    value={config.orm}
                    onChange={(e) => setConfig({ ...config, orm: e.target.value as any })}
                    className="w-full rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="prisma">Prisma</option>
                    <option value="drizzle">Drizzle ORM</option>
                    <option value="typeorm">TypeORM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Autenticación</label>
                  <select
                    value={config.auth}
                    onChange={(e) => setConfig({ ...config, auth: e.target.value as any })}
                    className="w-full rounded-lg border-slate-300 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="next-auth">NextAuth.js (Auth.js)</option>
                    <option value="clerk">Clerk</option>
                    <option value="supabase">Supabase Auth</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Console / Preview Tabs */}
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800">
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab('console')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'console'
                  ? 'bg-slate-800 text-white border-t-2 border-purple-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
              >
                <Terminal size={16} />
                Terminal
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                disabled={!generationComplete}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'preview'
                  ? 'bg-slate-800 text-white border-t-2 border-purple-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
              >
                <Eye size={16} />
                Vista Previa
              </button>
            </div>

            <div className="h-96 md:h-[500px] overflow-auto">
              {activeTab === 'console' ? (
                <div className="p-4 space-y-2 font-mono text-sm">
                  {/* ... console logic ... */}
                  {logs.length === 0 && !isGenerating ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                      <Terminal size={48} className="mb-4 opacity-50" />
                      <p>Listo para iniciar la generación</p>
                    </div>
                  ) : (
                    <>
                      {logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                          <span className="text-slate-500 text-xs mt-0.5 min-w-[60px]">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          {log.type === 'success' && <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />}
                          {log.type === 'error' && <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />}
                          {log.type === 'warning' && <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />}
                          {log.type === 'info' && <Clock size={16} className="text-blue-500 mt-0.5 shrink-0" />}
                          <span className={`
                            ${log.type === 'success' ? 'text-green-400' : ''}
                            ${log.type === 'error' ? 'text-red-400' : ''}
                            ${log.type === 'warning' ? 'text-amber-400' : ''}
                            ${log.type === 'info' ? 'text-blue-400' : ''}
                          `}>
                            {log.message}
                          </span>
                        </div>
                      ))}
                      {isGenerating && (
                        <div className="flex items-center gap-2 text-slate-400 animate-pulse mt-4 pl-[68px]">
                          <Loader size={16} className="animate-spin" />
                          <span className="typing-cursor">Procesando...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex h-full">
                  {/* File Tree */}
                  <div className="w-64 border-r border-slate-800 bg-slate-900/50 p-2 overflow-auto">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer mb-2">
                      <Package size={16} />
                      <span className="font-medium">proyecto-herman</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      {generatedFiles.map((file, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedFile(file.name)}
                          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${selectedFile === file.name
                            ? 'bg-purple-900/30 text-purple-300'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                          <FileCode size={14} />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Code Preview */}
                  <div className="flex-1 p-4 bg-slate-950 text-slate-300 font-mono text-sm overflow-auto">
                    {selectedFile ? (
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 mb-4 pb-2 border-b border-slate-800">
                          <FileCode size={16} />
                          {selectedFile}
                        </div>
                        <pre className="text-blue-300">
                          {(() => {
                            if (selectedFile === 'rbc-config.ts') {
                              return `// ${selectedFile} - Generated Automatically\n\n` +
                                `export const SYSTEM_ROLES = {\n` +
                                (catalogs?.roles?.map((r: any) => `  ${r.code}: '${r.id}', // ${r.name}`).join('\n') || '  // No roles defined') +
                                `\n};\n\n` +
                                `export const ROLE_HIERARCHY = {\n` +
                                (catalogs?.roles?.map((r: any) => `  [SYSTEM_ROLES.${r.code}]: [],`).join('\n') || '') +
                                `\n};\n`;
                            }
                            if (selectedFile === 'auth.ts') {
                              return `// ${selectedFile} - Auth Configuration\n` +
                                `import { SYSTEM_ROLES } from './config/rbc-config';\n\n` +
                                `export const authConfig = {\n` +
                                `  providers: [], // Configure auth providers here\n` +
                                `  callbacks: {\n` +
                                `    async session({ session, token }) {\n` +
                                `      if (session.user) {\n` +
                                `        session.user.role = token.role || SYSTEM_ROLES.GUEST;\n` +
                                `      }\n` +
                                `      return session;\n` +
                                `    }\n` +
                                `  }\n` +
                                `};\n`;
                            }
                            if (selectedFile === 'validation.ts') {
                              if (useCases.length > 0) {
                                return generateZodSchema(useCases[0]);
                              }
                              return '// No use cases defined to generate validation schemas';
                            }
                            if (selectedFile === 'route.ts') {
                              if (useCases.length > 0) {
                                return generateUseCaseController(useCases[0]);
                              }
                              return '// No use cases defined to generate controller';
                            }
                            if (selectedFile === 'middleware.ts') {
                              const protectedRoutes = useCases?.map((uc: any) => {
                                const requiredRoles = new Set();
                                uc.actors.forEach((a: any) => {
                                  // Find the role code using the actor's roleId
                                  const role = catalogs?.roles?.find((r: any) => r.id === a.roleId);
                                  if (role) requiredRoles.add(`SYSTEM_ROLES.${role.code}`);
                                });
                                if (requiredRoles.size === 0) return null;
                                return `  '/api/${uc.code.toLowerCase()}': [${Array.from(requiredRoles).join(', ')}], // ${uc.title}`;
                              }).filter(Boolean).join('\n');

                              return `// ${selectedFile} - RBAC Middleware\n` +
                                `import { SYSTEM_ROLES } from './config/rbc-config';\n\n` +
                                `const ROUTE_PERMISSIONS = {\n` +
                                (protectedRoutes || `  // No protected routes configured`) +
                                `\n};\n\n` +
                                `export function middleware(request) {\n` +
                                `  // Implementation of role-based access control\n` +
                                `}`;
                            }

                            return `// Contenido generado para ${selectedFile}\n\nimport React from 'react';\n\nexport default function Component() {\n  return (\n    <div className="p-4">\n      <h1>Generated Code for ${selectedFile}</h1>\n    </div>\n  );\n}`;
                          })()}
                        </pre>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <FileCode size={32} className="mb-2 opacity-50" />
                        <p>Selecciona un archivo para ver su contenido</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>


            {/* Status Bar */}
            <div className="bg-slate-950 border-t border-slate-800 p-2 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : generationComplete ? 'bg-green-500' : 'bg-slate-500'}`} />
                  {isGenerating ? 'Generando...' : generationComplete ? 'Completado' : 'Inactivo'}
                </span>
                <span>{logs.length} líneas de log</span>
              </div>
              <div className="flex items-center gap-4">
                <span>UTF-8</span>
                <span>TypeScript React</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-900 mb-4">Progreso</h3>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-100">
                  <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Step List */}
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  const isPending = index > currentStep;

                  return (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-1 ${isCompleted ? 'bg-green-100 text-green-600' :
                        isActive ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-100' :
                          'bg-slate-100 text-slate-300'
                        }`}>
                        {isCompleted ? <CheckCircle2 size={14} /> :
                          isActive ? <Loader size={14} className="animate-spin" /> :
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
                      </div>
                      <div className={`text-sm ${isActive ? 'font-medium text-slate-900' :
                        isCompleted ? 'text-slate-600' :
                          'text-slate-400'
                        }`}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {generationComplete && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-200">
                  <Download size={20} />
                  Descargar Proyecto ZIP
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  Incluye README.md con instrucciones de instalación
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Overwrite Modal */}
      {showConfirmOverwrite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">¿Confirmar generación?</h3>
              <p className="text-slate-600">
                Se generará una nueva estructura de proyecto. Asegúrate de haber revisado todos los requisitos y modelos antes de continuar.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowConfirmOverwrite(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmGenerate}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Comenzar Generación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <XCircle size={24} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">¿Cancelar generación?</h3>
              <p className="text-slate-600">
                El proceso de generación se detendrá y se perderá el progreso actual.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Volver
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Sí, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- AST Transpilers ---

// 1. Zod Schema Generator
const generateZodSchema = (useCase: any) => {
  const inputSteps = useCase.steps.filter((s: any) => s.type === 'USER_INPUT' && s.semantics?.inputs);
  if (inputSteps.length === 0) return '// No user input steps defined';

  const ucName = useCase.code.replace(/-/g, '_');
  let schemaCode = `import { z } from 'zod';\n\n`;
  schemaCode += `export const ${ucName}Schema = z.object({\n`;

  inputSteps.forEach((step: any) => {
    if (step.semantics.inputs) {
      step.semantics.inputs.forEach((input: any) => {
        let zType = 'z.string()';
        if (input.type === 'number' || input.type === 'decimal') zType = 'z.number()';
        if (input.type === 'boolean') zType = 'z.boolean()';
        if (input.type === 'date') zType = 'z.date()';
        if (input.type === 'email') zType = 'z.string().email()';

        if (!input.required) zType += '.optional()';

        schemaCode += `  ${input.name}: ${zType}, // Step ${step.order}: ${step.action}\n`;
      });
    }
  });

  schemaCode += `});\n\n`;
  schemaCode += `export type ${ucName}DTO = z.infer<typeof ${ucName}Schema>;`;
  return schemaCode;
};

// 2. Controller/Route Generator
const generateUseCaseController = (useCase: any) => {
  const ucName = useCase.code.replace(/-/g, '_');
  const className = `${useCase.title.replace(/\s+/g, '')}Controller`;

  let code = `/**\n`;
  code += ` * API Route for Use Case: ${useCase.code} - ${useCase.title}\n`;
  code += ` * Generated automatically by Herman-AI\n`;
  code += ` */\n`;
  code += `import { NextRequest, NextResponse } from 'next/server';\n`;
  code += `import { prisma } from '@/lib/prisma';\n`;
  code += `import { ${ucName}Schema } from './validation';\n`;
  code += `import { auth } from '@/auth';\n\n`;

  code += `export async function POST(req: NextRequest) {\n`;
  code += `  try {\n`;
  code += `    const session = await auth();\n`;
  code += `    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });\n\n`;

  code += `    const body = await req.json();\n\n`;

  code += `    // 1. Validation (Zod)\n`;
  code += `    const input = ${ucName}Schema.parse(body);\n\n`;

  code += `    // 2. Execution Flow\n`;

  useCase.steps.forEach((step: any) => {
    code += `    // Step ${step.order}: ${step.action}\n`;

    // AST-based Code Generation
    if (step.type === 'DB_OPERATION' && step.semantics) {
      const entity = step.semantics.targetEntity?.toLowerCase() || 'entity';
      const verb = step.semantics.verb === 'create' ? 'create' :
        step.semantics.verb === 'update' ? 'update' :
          step.semantics.verb === 'delete' ? 'delete' : 'findMany';

      code += `    const ${entity}_result = await prisma.${entity}.${verb}({\n`;
      code += `      data: {\n`;
      // Naive mapping of inputs to data fields
      if (step.semantics.inputs) {
        step.semantics.inputs.forEach((i: any) => {
          code += `        ${i.name}: input.${i.name},\n`;
        });
      }
      code += `      }\n`;
      code += `    });\n\n`;
    }
    else if (step.type === 'VALIDATION') {
      code += `    // Business Rule Check\n`;
      code += `    if (!checkRule('${step.action}')) {\n`;
      code += `       throw new Error('Business Rule Failed: ${step.action}');\n`;
      code += `    }\n\n`;
    }
    else if (step.type === 'SYSTEM_PROCESS') {
      const verb = step.semantics?.verb || 'process';
      code += `    // Logic: ${verb}\n`;
      code += `    // const result = await ${verb}Service.execute(input);\n\n`;
    }
  });

  code += `    return NextResponse.json({ success: true, data: { id: '123' } });\n`;
  code += `  } catch (error) {\n`;
  code += `    console.error(error);\n`;
  code += `    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });\n`;
  code += `  }\n`;
  code += `}`;

  return code;
};
