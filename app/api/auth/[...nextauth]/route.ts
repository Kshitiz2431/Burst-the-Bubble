declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { sendOTPEmail } from "@/lib/mail";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });

        if (!admin || !admin.isVerified) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Handle 2FA
        if (admin.twoFactorAuth) {
          if (!credentials.otp) {
            // Generate and send OTP
            const otp = randomInt(100000, 999999).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await prisma.admin.update({
              where: { id: admin.id },
              data: {
                currentOTP: otp,
                otpExpiry,
              },
            });

            await sendOTPEmail(admin.email, otp);
            throw new Error("OTP_REQUIRED");
          }

          // Verify OTP
          if (
            admin.currentOTP !== credentials.otp ||
            !admin.otpExpiry ||
            admin.otpExpiry < new Date()
          ) {
            throw new Error("Invalid OTP");
          }

          // Clear OTP after successful verification
          await prisma.admin.update({
            where: { id: admin.id },
            data: {
              currentOTP: null,
              otpExpiry: null,
            },
          });
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (!session.user) session.user = { id: "" };
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
