import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  masterPassword: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, masterPassword } = signupSchema.parse(body);

    // Verify master password
    if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid master password" },
        { status: 401 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: true, // Since we're using master password, we can verify directly
      },
    });

    return NextResponse.json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Error creating admin account" },
      { status: 500 }
    );
  }
}
