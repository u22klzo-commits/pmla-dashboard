import { z } from "zod";
import { Role, ResourceType, Gender, OfficialRank, IdType, ResourceStatus } from "@prisma/client";

// --- User Schemas ---

export const userUpdateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    username: z.string().min(3, "Username must be at least 3 characters").optional(),
});

export const userCreateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.nativeEnum(Role).optional().default("VIEWER"),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6, "Password must be at least 6 characters")
})


// --- Case Schemas ---

export const caseCreateSchema = z.object({
    caseNumber: z.string().min(1, "Case number is required"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
});

export const caseUpdateSchema = caseCreateSchema.partial();

// --- Resource Schemas ---

export const resourceCreateSchema = z.object({
    type: z.nativeEnum(ResourceType),
    name: z.string().min(2, "Name is required"),
    gender: z.nativeEnum(Gender).default("MALE"),
    rank: z.nativeEnum(OfficialRank).optional().nullable(),
    contactNumber: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    area: z.string().optional().nullable(),
    idType: z.nativeEnum(IdType).optional().nullable(),
    idNumber: z.string().optional().nullable(),
    designation: z.string().optional().nullable(),
    unit: z.string().optional().nullable(),
    remarks: z.string().optional().nullable(),
    licenseNumber: z.string().optional().nullable(), // For drivers
    vehicleType: z.string().optional().nullable(),   // For drivers
    vehicleRegNo: z.string().optional().nullable(),  // For drivers
    crpfMaleCount: z.number().int().nonnegative().optional().nullable(), // For CRPF
    crpfFemaleCount: z.number().int().nonnegative().optional().nullable(), // For CRPF
    details: z.string().optional().nullable(),
    status: z.nativeEnum(ResourceStatus).default("AVAILABLE"),
});

export const resourceUpdateSchema = resourceCreateSchema.partial();
