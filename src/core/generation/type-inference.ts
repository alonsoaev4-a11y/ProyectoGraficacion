
export const inferType = (fieldName: string, required: boolean = true): string => {
    const lowerName = fieldName.toLowerCase();

    let zodType = 'z.string()'; // Default

    // Heurísticas básicas
    if (lowerName.includes('email') || lowerName.includes('correo')) {
        zodType = 'z.string().email()';
    } else if (lowerName.includes('password') || lowerName.includes('contraseña')) {
        zodType = 'z.string().min(8)';
    } else if (lowerName.includes('edad') || lowerName.includes('age') || lowerName.includes('precio') || lowerName.includes('cantidad') || lowerName.includes('stock')) {
        zodType = 'z.number()';
        if (lowerName.includes('edad')) zodType += '.int().min(0)';
        if (lowerName.includes('precio')) zodType += '.positive()';
    } else if (lowerName.includes('fecha') || lowerName.includes('date') || lowerName.includes('born') || lowerName.includes('nacimiento')) {
        // Aceptamos string ISO por simplicidad en JSON
        zodType = 'z.string().datetime()';
    } else if (lowerName.includes('activo') || lowerName.includes('enabled') || lowerName.includes('is')) {
        zodType = 'z.boolean()';
    } else if (lowerName.includes('id') && !lowerName.includes('uuid')) {
        // Asumimos IDs como strings (CUID/UUID)
        zodType = 'z.string()';
    }

    if (!required) {
        zodType += '.optional()';
    }

    return zodType;
};

export const inferTsType = (fieldName: string): string => {
    const lowerName = fieldName.toLowerCase();

    if (lowerName.includes('edad') || lowerName.includes('precio') || lowerName.includes('cantidad')) return 'number';
    if (lowerName.includes('activo') || lowerName.includes('enabled')) return 'boolean';
    if (lowerName.includes('fecha')) return 'Date'; // O string dependiendo del manejo
    return 'string';
}
