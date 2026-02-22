import { useState } from 'react';
import { UseCase, Catalogs } from './types';
import { UseCaseList } from './components/UseCaseList';
import { UseCaseDetail } from './components/UseCaseDetail';

interface EditorCasosUsoProps {
    useCases: UseCase[];
    catalogs: Catalogs;
    onUpdate: (useCases: UseCase[]) => void;
    onUpdateCatalogs: (catalogs: Catalogs) => void;
}

export function EditorCasosUso({ useCases, catalogs, onUpdate, onUpdateCatalogs }: EditorCasosUsoProps) {
    const [selectedUseCaseId, setSelectedUseCaseId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Selection
    const selectedUseCase = useCases.find(uc => uc.id === selectedUseCaseId);

    // Handlers for List View
    const handleCreateUseCase = () => {
        const newUseCase: UseCase = {
            id: Date.now().toString(),
            code: `CU-${String(useCases.length + 1).padStart(2, '0')}`,
            title: 'Nuevo Caso de Uso',
            description: '',
            type: 'Esencial',
            priority: 'media',
            status: 'draft',
            actors: [],
            preconditions: [],
            postconditions: [],
            businessRules: [],
            exceptions: [],
            steps: [],
            alternativeFlows: [],
        };
        onUpdate([...useCases, newUseCase]);
        setSelectedUseCaseId(newUseCase.id);
        setIsEditing(true);
    };

    const handleDeleteUseCase = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de eliminar este caso de uso?')) {
            onUpdate(useCases.filter(uc => uc.id !== id));
            if (selectedUseCaseId === id) setSelectedUseCaseId(null);
        }
    };

    const handleUpdateCurrent = (updated: UseCase) => {
        onUpdate(useCases.map(uc => uc.id === updated.id ? updated : uc));
    };

    if (!selectedUseCase) {
        return (
            <UseCaseList
                useCases={useCases}
                selectedUseCaseId={selectedUseCaseId}
                onSelect={(id) => setSelectedUseCaseId(id)}
                onCreate={handleCreateUseCase}
                onDelete={handleDeleteUseCase}
            />
        );
    }

    return (
        <UseCaseDetail
            useCase={selectedUseCase}
            catalogs={catalogs}
            onUpdate={handleUpdateCurrent}
            onUpdateCatalogs={onUpdateCatalogs}
            onBack={() => setSelectedUseCaseId(null)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
        />
    );
}
