// 🚨 ESTRATEGIA ALTERNATIVA: Usar solo si tienes > 10,000 registros
// Este código es para referencia, NO lo uses en tu proyecto actual

import { useState, useEffect, useCallback } from 'react';
import axios from '../../../utils/axios';

/**
 * Hook personalizado para carga de datos por estado
 * Usar SOLO si tienes datasets enormes (> 10,000 registros)
 */
export function useLazyLoadByStatus(userId, userRole) {
    const [dataByStatus, setDataByStatus] = useState({
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
    });
    const [loading, setLoading] = useState({});
    const [currentStatus, setCurrentStatus] = useState(0);

    // Función para cargar datos de un estado específico
    const loadStatusData = useCallback(async (status) => {
        // Si ya tenemos los datos, no recargar
        if (dataByStatus[status] !== null) {
            return dataByStatus[status];
        }

        setLoading(prev => ({ ...prev, [status]: true }));

        try {
            let url = '';
            if (userRole === '7') {
                url = `/hanadb/api/customers/lista_validar_info_prospecto_cartera_by_user?id_user=${userId}&estado=${status}`;
            } else {
                url = `/hanadb/api/customers/lista_validar_info_prospecto_cartera?estado=${status}`;
            }

            const response = await axios.get(url);
            
            setDataByStatus(prev => ({
                ...prev,
                [status]: response.data
            }));

            return response.data;

        } catch (error) {
            console.error(`Error loading status ${status}:`, error);
            return [];
        } finally {
            setLoading(prev => ({ ...prev, [status]: false }));
        }
    }, [userId, userRole, dataByStatus]);

    // Cargar el estado inicial
    useEffect(() => {
        if (userId) {
            loadStatusData(currentStatus);
        }
    }, [userId, currentStatus, loadStatusData]);

    // Función para cambiar de estado (con prefetch)
    const changeStatus = useCallback(async (newStatus) => {
        setCurrentStatus(newStatus);
        
        // Cargar el nuevo estado si no está cargado
        if (dataByStatus[newStatus] === null) {
            await loadStatusData(newStatus);
        }

        // Prefetch: Cargar el siguiente estado en segundo plano
        const nextStatus = (newStatus + 1) % 6;
        if (dataByStatus[nextStatus] === null) {
            setTimeout(() => loadStatusData(nextStatus), 1000);
        }
    }, [dataByStatus, loadStatusData]);

    // Función para refrescar un estado específico
    const refreshStatus = useCallback(async (status = currentStatus) => {
        setDataByStatus(prev => ({
            ...prev,
            [status]: null // Marcar como no cargado
        }));
        await loadStatusData(status);
    }, [currentStatus, loadStatusData]);

    // Función para invalidar toda la cache
    const refreshAll = useCallback(() => {
        setDataByStatus({
            0: null,
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
        });
    }, []);

    return {
        currentData: dataByStatus[currentStatus] || [],
        isLoading: loading[currentStatus] || false,
        changeStatus,
        refreshStatus,
        refreshAll,
        dataByStatus,
    };
}

/**
 * EJEMPLO DE USO:
 * 
 * function MyComponent() {
 *     const { user } = useAuthContext();
 *     const {
 *         currentData,
 *         isLoading,
 *         changeStatus,
 *         refreshStatus
 *     } = useLazyLoadByStatus(user?.ID, user?.ROLE);
 * 
 *     const handleTabChange = (newTab) => {
 *         changeStatus(newTab);
 *     };
 * 
 *     return (
 *         <div>
 *             <Tabs value={currentStatus} onChange={(e, val) => handleTabChange(val)}>
 *                 {/ tabs aquí /}
 *             </Tabs>
 *             
 *             {isLoading ? (
 *                 <CircularProgress />
 *             ) : (
 *                 <DataGrid rows={currentData} />
 *             )}
 *         </div>
 *     );
 * }
 */

// NOTA: Este código requiere modificar el backend para aceptar parámetro ?estado=X
// Ver archivo: BACKEND_MODIFICACIONES_PARA_LAZY_LOAD.md
