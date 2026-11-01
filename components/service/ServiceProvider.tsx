'use client';
import {BeanContext} from '@/components/crefans/BeanContext';
import {useBeansModel} from '@/features/service/useBeansModel';
import {createContext,useContext,type ReactNode} from 'react';
import {useServiceModel} from '@/features/service/useServiceModel';
const Context=createContext<ReturnType<typeof useServiceModel>|null>(null);
export function ServiceProvider({children}:{children:ReactNode}){const state=useServiceModel(),beans=useBeansModel(state.model.beanSupport===true,state.model.signedIn,state.model.ownCreatorIds||[]);return <Context.Provider value={state}><BeanContext.Provider value={beans}>{children}</BeanContext.Provider></Context.Provider>;}
export function useService(){const state=useContext(Context);if(!state)throw new Error('ServiceProvider is required');return state;}
