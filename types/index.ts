// store/types/index.ts
export interface User {
    id: string;
    name: string | null; 
    email: string | null; 
    UserRole: 'placemaker' | 'policymaker' | 'dealmaker' | 'changemaker';
  }
  
  export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
  }