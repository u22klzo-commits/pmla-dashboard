import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuthResult<T = void> =
    | { success: true; data?: T; session: any; isOwner?: boolean; isAdmin?: boolean } // session is typed loosely here to avoid circular dep issues, but it's the NextAuth session
    | { success: false; error: string };

/**
 * Validates that a user is authenticated.
 */
export async function requireAuth(): Promise<AuthResult> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized: Please log in." };
    }

    return { success: true, session, isAdmin: session.user.role === 'ADMIN' };
}

/**
 * Validates that a user is authenticated and has one of the allowed roles.
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthResult> {
    const auth = await requireAuth();
    if (!auth.success) return auth;

    const userRole = auth.session.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
        return { success: false, error: "Forbidden: Insufficient permissions." };
    }

    return auth;
}

/**
 * Validates that a user can access/modify a specific case.
 * Rules:
 * - Admin: Access everything.
 * - Owner: Access their own cases.
 * - Collaborator: Access cases they are added to.
 */
export async function requireCaseAccess(caseId: string, type: 'READ' | 'WRITE' | 'DELETE' = 'READ'): Promise<AuthResult> {
    const auth = await requireAuth();
    if (!auth.success) return auth;

    const { id: userId, role } = auth.session.user;

    // Admins can do anything
    if (role === 'ADMIN') {
        return { ...auth, isOwner: false, isAdmin: true }; // Admin is not "owner" per se, but has full access
    }

    const caseItem = await prisma.case.findUnique({
        where: { id: caseId },
        include: { collaborators: { select: { id: true } } }
    });

    if (!caseItem) {
        return { success: false, error: "Case not found." };
    }

    const isOwner = caseItem.ownerId === userId;
    const isCollaborator = caseItem.collaborators.some(c => c.id === userId);

    if (role === 'VIEWER') {
        if (type !== 'READ') {
            return { success: false, error: "Forbidden: Viewers have read-only access." };
        }
        // Viewers can only READ if they are owner (unlikely) or collaborator
        if (!isOwner && !isCollaborator) {
            return { success: false, error: "Forbidden: You do not have permission to view this case." };
        }
        return { ...auth, isOwner, isAdmin: false };
    }

    if (type === 'DELETE') {
        // Only Owner (or Admin, checked above) can delete
        if (!isOwner) return { success: false, error: "Forbidden: Only the case owner can delete this case." };
    } else if (type === 'WRITE') {
        // Owner or Collaborator can edit
        if (!isOwner && !isCollaborator) return { success: false, error: "Forbidden: You do not have permission to edit this case." };
    } else {
        // READ
        if (!isOwner && !isCollaborator) return { success: false, error: "Forbidden: You do not have permission to view this case." };
    }

    return { ...auth, isOwner, isAdmin: false };
}

/**
 * Calculates UI permissions for a case based on user role and relationship to the case.
 * This is a synchronous helper for UI/client-side checks where data is already available.
 * 
 * @param role - The user's role
 * @param userId - The user's ID
 * @param ownerId - The case owner's ID
 * @param collaboratorIds - The IDs of collaborators on the case
 */
export function getCasePermissions(
    role: Role,
    userId: string,
    ownerId: string | null,
    collaboratorIds: string[]
) {
    const isOwner = userId === ownerId;
    const isCollaborator = collaboratorIds.includes(userId);
    const isAdmin = role === 'ADMIN';

    // Viewer permissions are very restricted
    if (role === 'VIEWER') {
        return {
            canEdit: false,
            canDelete: false,
            canManageCollaborators: false, // Viewers cannot manage collaborators
        };
    }

    // Admin permissions
    if (isAdmin) {
        return {
            canEdit: true,
            canDelete: true,
            canManageCollaborators: true,
        };
    }

    // Owner permissions
    if (isOwner) {
        return {
            canEdit: true,
            canDelete: true,
            canManageCollaborators: true,
        };
    }

    // Collaborator permissions (Commanders/Officers only, since Viewers are handled above)
    if (isCollaborator) {
        return {
            canEdit: true,
            canDelete: false, // Collaborators cannot delete cases
            canManageCollaborators: true, // Collaborators can now manage other collaborators
        };
    }

    // Default: No permissions
    return {
        canEdit: false,
        canDelete: false,
        canManageCollaborators: false,
    };
}
