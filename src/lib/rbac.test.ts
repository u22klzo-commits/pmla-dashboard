
import { getCasePermissions } from "./rbac";
import { Role } from "@prisma/client";

function runTests() {
    console.log("Running RBAC Logic Verification...");

    const testCases = [
        // 1. Admin - Should have all permissions
        {
            name: "Admin Access",
            params: { role: 'ADMIN' as Role, userId: 'admin-1', ownerId: 'user-2', collaboratorIds: [] },
            expected: { canEdit: true, canDelete: true, canManageCollaborators: true }
        },
        // 2. Owner (Officer) - Should have all permissions
        {
            name: "Owner Access",
            params: { role: 'OFFICER' as Role, userId: 'owner-1', ownerId: 'owner-1', collaboratorIds: [] },
            expected: { canEdit: true, canDelete: true, canManageCollaborators: true }
        },
        // 3. Collaborator (Officer) - Should have Edit, NO Delete, NO Manage
        {
            name: "Collaborator Access",
            params: { role: 'OFFICER' as Role, userId: 'collab-1', ownerId: 'owner-1', collaboratorIds: ['collab-1'] },
            expected: { canEdit: true, canDelete: false, canManageCollaborators: true }
        },
        // 4. Viewer (Collaborator) - Should have NO Write/Delete/Manage even if collaborator
        {
            name: "Viewer (Collaborator) Access",
            params: { role: 'VIEWER' as Role, userId: 'viewer-1', ownerId: 'owner-1', collaboratorIds: ['viewer-1'] },
            expected: { canEdit: false, canDelete: false, canManageCollaborators: false }
        },
        // 5. Viewer (Owner - Unlikely but possible) - Should have NO Write/Delete/Manage
        {
            name: "Viewer (Owner) Access",
            params: { role: 'VIEWER' as Role, userId: 'viewer-1', ownerId: 'viewer-1', collaboratorIds: [] },
            expected: { canEdit: false, canDelete: false, canManageCollaborators: false }
        },
        // 6. Unrelated User - Should have NO permissions
        {
            name: "Unrelated User Access",
            params: { role: 'OFFICER' as Role, userId: 'stranger-1', ownerId: 'owner-1', collaboratorIds: [] },
            expected: { canEdit: false, canDelete: false, canManageCollaborators: false }
        }
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach((test, index) => {
        const result = getCasePermissions(
            test.params.role,
            test.params.userId,
            test.params.ownerId,
            test.params.collaboratorIds
        );

        const isMatch =
            result.canEdit === test.expected.canEdit &&
            result.canDelete === test.expected.canDelete &&
            result.canManageCollaborators === test.expected.canManageCollaborators;

        if (isMatch) {
            console.log(`✅ Test ${index + 1}: ${test.name} PASSED`);
            passed++;
        } else {
            console.error(`❌ Test ${index + 1}: ${test.name} FAILED`);
            console.error(`   Expected:`, test.expected);
            console.error(`   Got:     `, result);
            failed++;
        }
    });

    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
