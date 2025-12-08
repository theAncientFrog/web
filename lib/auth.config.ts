import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import type { AuthOptions } from 'next-auth';
import type { Role, User } from '@prisma/client';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Будь ласка, введіть email та пароль.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Користувача не знайдено або вхід через Google.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Неправильний пароль.');
        }

        return user;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
    error: '/login',
  },

  events: {
    async createUser({ user }) {
      // Коли створюється новий користувач через OAuth, встановлюємо роль за замовчуванням
      if (user.email) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: 'CUSTOMER' },
          });
        } catch (error) {
          console.error('Error setting default role:', error);
        }
      }
    },
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Якщо це Google OAuth
        if (account?.provider === 'google' && user?.email) {
          // Перевіряємо, чи існує користувач
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // Якщо користувача немає, він буде створений через PrismaAdapter
          // Роль буде встановлена через events.createUser
          if (!existingUser) {
            return true;
          }

          // Якщо користувач існує, перевіряємо, чи має він роль
          if (!existingUser.role) {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: 'CUSTOMER' },
            });
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },

    async jwt({ token, user, trigger, account }) {
      try {
        // При першому логіні додаємо дані користувача
        if (user) {
          const prismaUser = user as User;
          
          // Якщо це Google OAuth, можливо user.id не передається правильно
          // Тому шукаємо користувача за email
          if (account?.provider === 'google' && user.email && !prismaUser.id) {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: { id: true, role: true, name: true, email: true, image: true },
            });
            
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role || 'CUSTOMER';
              token.name = dbUser.name;
              token.email = dbUser.email;
              token.image = dbUser.image;
            } else {
              console.error('[JWT] User not found after Google OAuth:', user.email);
            }
          } else {
            token.id = prismaUser.id;
            token.role = prismaUser.role || 'CUSTOMER';
            token.name = prismaUser.name;
            token.email = prismaUser.email;
            token.image = prismaUser.image;
          }

          // Якщо це Google OAuth і роль не встановлена, оновлюємо в БД
          if (account?.provider === 'google' && token.id) {
            try {
              const userId = token.id as number;
              const dbUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
              });
              
              if (dbUser && !dbUser.role) {
                await prisma.user.update({
                  where: { id: userId },
                  data: { role: 'CUSTOMER' },
                });
                token.role = 'CUSTOMER';
              }
            } catch (error) {
              console.error('Error updating user role:', error);
            }
          }
        }

        // Якщо токен існує, але дані не збережені — дістаємо з БД
        if (token.id && !token.role) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as number },
            select: { role: true, name: true, email: true, image: true },
          });
          if (dbUser) {
            token.role = dbUser.role || 'CUSTOMER';
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.image = dbUser.image;
          }
        }

        // Оновлюємо дані при trigger === 'update'
        if (trigger === 'update' && token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as number },
            select: { role: true, name: true, email: true, image: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.image = dbUser.image;
          }
        }

        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (session.user && token) {
          session.user.id = token.id as number;
          session.user.role = token.role as Role;
          session.user.name = token.name as string | null;
          session.user.email = token.email as string | null;
          session.user.image = token.image as string | null;
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
};
