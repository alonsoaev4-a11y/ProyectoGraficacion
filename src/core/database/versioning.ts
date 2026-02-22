export const generateMigrationName = (description: string): string => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
    const sanitizedDesc = description.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `${timestamp}_${sanitizedDesc}`;
};
