import { createContext } from 'react';
import { AccountForm } from './types';

export default createContext<Partial<AccountForm>>({ chosenAttributes: [] });
