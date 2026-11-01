'use client';
import {createContext,useContext} from 'react';
import type {BeanModel} from '@/types/crefans-beans';
export const BeanContext=createContext<BeanModel|null>(null);
export const useBeans=()=>useContext(BeanContext);
