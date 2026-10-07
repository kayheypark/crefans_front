'use client';
import {createContext,useContext,type ReactNode} from 'react';
import {useServiceModel} from '@/features/service/useServiceModel';
const Context=createContext<ReturnType<typeof useServiceModel>|null>(null);
export function ServiceProvider({children}:{children:ReactNode}){const state=useServiceModel();return <Context.Provider value={state}>{children}</Context.Provider>;}
export function useService(){const state=useContext(Context);if(!state)throw new Error('ServiceProvider is required');return state;}
