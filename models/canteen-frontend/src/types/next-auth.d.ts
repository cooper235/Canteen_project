import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      token: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    token: string;
  }
}