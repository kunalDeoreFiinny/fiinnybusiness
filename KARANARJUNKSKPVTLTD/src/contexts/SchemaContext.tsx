import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ModuleSchema } from '../types/schema';
import { fetchAllSchemas, saveModuleSchema } from '../services/schemaService';
import { useAuth } from './AuthContext';

interface SchemaContextType {
    schemas: Record<string, ModuleSchema>;
    loading: boolean;
    getSchema: (moduleId: string) => ModuleSchema | undefined;
    updateSchema: (moduleId: string, newSchema: ModuleSchema) => Promise<void>;
    refreshSchemas: () => Promise<void>;
}

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export function SchemaProvider({ children }: { children: ReactNode }) {
    const { tenantId } = useAuth();
    const [schemas, setSchemas] = useState<Record<string, ModuleSchema>>({});
    const [loading, setLoading] = useState(true);

    const loadSchemas = async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const allSchemas = await fetchAllSchemas(tenantId);
            const schemaMap: Record<string, ModuleSchema> = {};

            allSchemas.forEach(schema => {
                schemaMap[schema.moduleId] = schema;
            });

            setSchemas(schemaMap);
        } catch (error) {
            console.error("Failed to load schemas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchemas();
    }, [tenantId]);

    const getSchema = (moduleId: string) => {
        return schemas[moduleId];
    };

    const updateSchema = async (moduleId: string, newSchema: ModuleSchema) => {
        if (!tenantId) return;
        await saveModuleSchema(tenantId, moduleId, newSchema);

        // Update local state instantly
        setSchemas(prev => ({
            ...prev,
            [moduleId]: newSchema
        }));
    };

    return (
        <SchemaContext.Provider value={{ schemas, loading, getSchema, updateSchema, refreshSchemas: loadSchemas }}>
            {children}
        </SchemaContext.Provider>
    );
}

export function useSchema() {
    const context = useContext(SchemaContext);
    if (!context) {
        throw new Error('useSchema must be used within a SchemaProvider');
    }
    return context;
}
