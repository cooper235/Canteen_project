import { type GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export const getAuthSession = () => {
  return getServerSession(authOptions);
};

export const protectRoute = async (context: GetServerSidePropsContext, allowedRoles?: string[]) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  if (allowedRoles && !allowedRoles.includes((session.user as any).role)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'canteen_owner' | 'admin';
};