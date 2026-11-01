'use client';
import {BeanStudioPage} from './BeanPages';
import {SettlementAccountsPage} from './studio/FinancePages';
import {WithdrawalSecurityPage} from './studio/WithdrawalSecurityPage';
import type {StudioFinanceModel} from '@/types/crefans-studio-finance';
// Fan route for members holding withdrawable beans (e.g. referral rewards) without a creator studio.
export function BeanWithdrawPage({finance,basePath}:{finance:StudioFinanceModel;basePath:string}){const path=`${basePath}/beans/withdraw`;
 return <><BeanStudioPage receivables={finance.data.receivables} closingBlockers={finance.data.closingBlockers} links={{back:`${basePath}/beans`,backLabel:'지갑으로 돌아가기',accounts:`${path}#accounts`,security:`${path}#security`}}/><div id="accounts"><SettlementAccountsPage model={finance} basePath={`${basePath}/studio`} embedded/></div><div id="security"><WithdrawalSecurityPage model={finance} basePath={`${basePath}/studio`} embedded/></div></>;}
