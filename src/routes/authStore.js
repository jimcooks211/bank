// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      formStage: 'signup',
      userData: null,
      setFormStage: (stage) => set({ formStage: stage }),
      setUserData: (data) => set({ userData: data }),
      resetFlow: () => set({ formStage: 'signup', userData: null }),
    }),
    {
      name: 'paypal-signup-flow',           // key in storage
      storage: createJSONStorage(() => sessionStorage), // or localStorage
      partialize: (state) => ({ formStage: state.formStage, userData: state.userData }),
    }
  )
);