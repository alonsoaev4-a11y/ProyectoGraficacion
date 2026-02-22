// useToast.ts — Micro hook para feedback de "guardado" en secciones de Metadatos

import { useState, useCallback } from 'react';

export function useToast(mensaje = 'Configuración guardada', duracionMs = 2000) {
    const [toast, setToast] = useState<string | null>(null);

    const guardado = useCallback(() => {
        setToast(mensaje);
        setTimeout(() => setToast(null), duracionMs);
    }, [mensaje, duracionMs]);

    return { toast, guardado };
}
