// src/stores/userStore.ts
import { create } from 'zustand';
import { User } from '../types';

interface UserState {
    currentUser: User | null;
    usersList: User[];
    setCurrentUser: (user: User | null) => void;
    setUsersList: (users: User[]) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    currentUser: null,
    usersList: [],
    setCurrentUser: (user) => set({ currentUser: user }),
    setUsersList: (users) => set({ usersList: users }),
    logout: () => set({ currentUser: null })
}));