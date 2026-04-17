import { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import axios from '../utils/axios';
import { useAuthContext } from './useAuthContext';

const CACHE_KEY = 'warehouse_list_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

export const WarehouseContext = createContext(null);

function getCachedWarehouses(empresa) {
    try {
        const raw = localStorage.getItem(`${CACHE_KEY}_${empresa}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp > CACHE_TTL) {
            localStorage.removeItem(`${CACHE_KEY}_${empresa}`);
            return null;
        }
        return parsed.data;
    } catch {
        return null;
    }
}

function setCachedWarehouses(empresa, data) {
    try {
        localStorage.setItem(`${CACHE_KEY}_${empresa}`, JSON.stringify({
            timestamp: Date.now(),
            data,
        }));
    } catch {
        // localStorage lleno, ignorar
    }
}

export function WarehouseProvider({ children }) {
    const { user, isAuthenticated } = useAuthContext();

    // { [empresa]: { [WhsCode]: WhsName } }
    const [warehouseMap, setWarehouseMap] = useState({});
    // { [empresa]: [{ WhsCode, WhsName }] }
    const [warehouseList, setWarehouseList] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchWarehouses = useCallback(async (empresa) => {
        if (!empresa) return;

        // Revisar cache
        const cached = getCachedWarehouses(empresa);
        if (cached) {
            const map = {};
            cached.forEach((w) => { map[w.WhsCode] = w.WhsName; });
            setWarehouseMap((prev) => ({ ...prev, [empresa]: map }));
            setWarehouseList((prev) => ({ ...prev, [empresa]: cached }));
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/hanadb/api/warehouse/list?empresa=${empresa}`);
            if (response.data?.status === 'success' && response.data?.data) {
                const data = response.data.data;
                setCachedWarehouses(empresa, data);
                const map = {};
                data.forEach((w) => { map[w.WhsCode] = w.WhsName; });
                setWarehouseMap((prev) => ({ ...prev, [empresa]: map }));
                setWarehouseList((prev) => ({ ...prev, [empresa]: data }));
            }
        } catch (error) {
            console.error('Error al cargar bodegas:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user?.EMPRESA) {
            fetchWarehouses(user.EMPRESA);
        }
    }, [isAuthenticated, user?.EMPRESA, fetchWarehouses]);

    const getWarehouseName = useCallback((code, empresa) => {
        const emp = empresa || user?.EMPRESA;
        if (!emp || !warehouseMap[emp]) return code || 'Bodega no definida';
        return warehouseMap[emp][code] || code || 'Bodega no definida';
    }, [warehouseMap, user?.EMPRESA]);

    const getWarehouseList = useCallback((empresa) => {
        const emp = empresa || user?.EMPRESA;
        if (!emp || !warehouseList[emp]) return [];
        return warehouseList[emp];
    }, [warehouseList, user?.EMPRESA]);

    const value = useMemo(() => ({
        getWarehouseName,
        getWarehouseList,
        loading,
        fetchWarehouses,
    }), [getWarehouseName, getWarehouseList, loading, fetchWarehouses]);

    return (
        <WarehouseContext.Provider value={value}>
            {children}
        </WarehouseContext.Provider>
    );
}
