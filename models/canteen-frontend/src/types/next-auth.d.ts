import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      token: string;
      canteenId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    token: string;
    canteenId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    token: string;
    canteenId?: string;
  }
}