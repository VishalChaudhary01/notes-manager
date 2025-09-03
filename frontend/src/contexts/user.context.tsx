import React, { createContext, useContext } from 'react';

export interface IUser {
  name: string;
  email: string;
}

export interface IUserContext {
  isLoading: boolean;
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

export const UserContext = createContext<IUserContext | null>(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used inside UserContextProvider');
  }
  return context;
}
