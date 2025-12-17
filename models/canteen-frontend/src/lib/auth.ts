import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 [NextAuth] Attempting login for:', credentials?.email);
          
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          console.log('📡 [NextAuth] Backend response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [NextAuth] Login failed:', errorData);
            return null;
          }

          const data = await response.json();
          console.log('✅ [NextAuth] Login successful:', { 
            userId: data.user?.id || data.user?._id, 
            role: data.user?.role,
            hasToken: !!data.token 
          });
          
          const user = data.user;

          return {
            id: user.id || user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: data.token,
            canteenId: user.canteenId,
          };
        } catch (error) {
          console.error('💥 [NextAuth] Exception during login:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.token = user.token;
        token.canteenId = user.canteenId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).token = token.token;
        (session.user as any).canteenId = token.canteenId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};