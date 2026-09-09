export interface User {
  username: string;
  attributes: {
    email: string;
    email_verified: boolean;
    preferred_username: string;
    name: string;
    sub: string;
    picture?: string;
    nickname: string;
    phone_number: string;
  };
  points: number;
  isCreator: boolean;
  profile?: {
    bio?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface AuthContextType {
  user: User | null | undefined;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => void;
}
