import { useAuth } from '../contexts/AuthContext';

export function useModule(moduleId: string) {
    const { hasModule, enabledModules, modulesLoading, tenantPlan } = useAuth();
    return {
        enabled: hasModule(moduleId),
        loading: modulesLoading,
        tenantPlan,
        enabledModules,
    };
}
