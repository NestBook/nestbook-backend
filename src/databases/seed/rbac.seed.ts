import 'reflect-metadata';
import 'dotenv/config';

import { DataSource, EntityManager } from 'typeorm';

import {
    PermissionEntity,
    PermissionStatus,
} from '../../modules/permission/entities/permission.entity';

import {
    RoleEntity,
    RoleStatus,
} from '../../modules/role/entities/role.entity';

import { RolePermissionEntity } from '../../modules/role/entities/role-permission.entity';

type CrudAction = 'read' | 'create' | 'update' | 'delete';

interface CrudActionItem {
    action: CrudAction;
    label: string;
}

interface RbacResourceItem {
    code: string;
    name: string;
    permissionPrefix: string;
    actions: CrudAction[];
}

interface SeedPermission {
    code: string;
    name: string;
    resource: string;
    action: string;
    description: string;
}

const CRUD_ACTIONS: CrudActionItem[] = [
    {
        action: 'read',
        label: 'Read',
    },
    {
        action: 'create',
        label: 'Create',
    },
    {
        action: 'update',
        label: 'Update',
    },
    {
        action: 'delete',
        label: 'Delete',
    },
];

const RBAC_RESOURCES: RbacResourceItem[] = [
    {
        code: 'DASHBOARD',
        name: 'Dashboard',
        permissionPrefix: 'dashboard',
        actions: ['read'],
    },
    {
        code: 'USER',
        name: 'User',
        permissionPrefix: 'user',
        actions: ['read', 'create', 'update', 'delete'],
    },
    {
        code: 'ROLE',
        name: 'Role',
        permissionPrefix: 'role',
        actions: ['read', 'create', 'update', 'delete'],
    },
    {
        code: 'PERMISSION',
        name: 'Permission',
        permissionPrefix: 'permission',
        actions: ['read'],
    },
    {
        code: 'HOTEL',
        name: 'Hotel',
        permissionPrefix: 'hotel',
        actions: ['read', 'create', 'update', 'delete'],
    },
    {
        code: 'ROOM_TYPE',
        name: 'Room Type',
        permissionPrefix: 'room_type',
        actions: ['read', 'create', 'update', 'delete'],
    },
    {
        code: 'BOOKING',
        name: 'Booking',
        permissionPrefix: 'booking',
        actions: ['read', 'create', 'update', 'delete'],
    },
    {
        code: 'REVIEW',
        name: 'Review',
        permissionPrefix: 'review',
        actions: ['read', 'create', 'update', 'delete'],
    },
    {
        code: 'PAYMENT',
        name: 'Payment',
        permissionPrefix: 'payment',
        actions: ['read', 'create', 'update', 'delete'],
    },
    {
        code: 'VOUCHER',
        name: 'Voucher',
        permissionPrefix: 'voucher',
        actions: ['read', 'create', 'update', 'delete'],
    },
    {
        code: 'SUBSCRIPTION_PLAN',
        name: 'Subscription Plan',
        permissionPrefix: 'subscription_plan',
        actions: ['read', 'create', 'update', 'delete'],
    },
];

const EXTRA_PERMISSIONS: SeedPermission[] = [
    {
        code: 'user.assign_role',
        name: 'Assign Role To User',
        resource: 'USER',
        action: 'assign_role',
        description: 'ASSIGN_ROLE: Allow assign role User',
    },
    {
        code: 'role.assign_permission',
        name: 'Assign Permission To Role',
        resource: 'ROLE',
        action: 'assign_permission',
        description: 'ASSIGN_PERMISSION: Allow assign permission Role',
    },
    {
        code: 'booking.cancel',
        name: 'Cancel Booking',
        resource: 'BOOKING',
        action: 'cancel',
        description: 'CANCEL: Allow cancel Booking',
    },
];

const ROLES = [
    {
        code: 'ADMIN',
        name: 'Admin',
        description: 'System administrator',
    },
    {
        code: 'HOTEL_OWNER',
        name: 'Hotel Owner',
        description: 'Hotel owner account',
    },
    {
        code: 'CUSTOMER',
        name: 'Customer',
        description: 'Customer account',
    },
];

function buildPermissions(): SeedPermission[] {
    const permissions: SeedPermission[] = [];

    for (const resource of RBAC_RESOURCES) {
        for (const crudAction of CRUD_ACTIONS) {
            if (!resource.actions.includes(crudAction.action)) {
                continue;
            }

            permissions.push({
                code: `${resource.permissionPrefix}.${crudAction.action}`,
                name: `${crudAction.label} ${resource.name}`,
                resource: resource.code,
                action: crudAction.action,
                description: `${crudAction.action.toUpperCase()}: Allow ${crudAction.label} ${resource.name}`,
            });
        }
    }

    permissions.push(...EXTRA_PERMISSIONS);

    return permissions;
}

const PERMISSIONS = buildPermissions();

const ROLE_PERMISSIONS: Record<string, string[]> = {
    ADMIN: PERMISSIONS.map((permission) => permission.code),

    HOTEL_OWNER: [
        'dashboard.read',

        'hotel.read',
        'hotel.create',
        'hotel.update',
        'hotel.delete',

        'room_type.read',
        'room_type.create',
        'room_type.update',
        'room_type.delete',

        'booking.read',
        'booking.update',
        'booking.cancel',

        'review.read',

        'payment.read',

        'voucher.read',
    ],

    CUSTOMER: [
        'hotel.read',
        'room_type.read',

        'booking.read',
        'booking.create',
        'booking.cancel',

        'review.read',
        'review.create',

        'payment.create',

        'voucher.read',
    ],
};

const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    /**
     * Seed only inserts/updates default data.
     * Main app/ORM creates tables.
     */
    synchronize: false,

    entities: [PermissionEntity, RoleEntity, RolePermissionEntity],
});

async function seedPermissions(manager: EntityManager): Promise<void> {
    const permissionRepository = manager.getRepository(PermissionEntity);

    for (const item of PERMISSIONS) {
        const existingPermission = await permissionRepository.findOne({
            where: {
                code: item.code,
            },
        });

        if (existingPermission) {
            existingPermission.name = item.name;
            existingPermission.resource = item.resource;
            existingPermission.action = item.action;
            existingPermission.description = item.description;
            existingPermission.isSystem = true;
            existingPermission.status = PermissionStatus.ACTIVE;

            await permissionRepository.save(existingPermission);
            continue;
        }

        const permission = permissionRepository.create({
            code: item.code,
            name: item.name,
            resource: item.resource,
            action: item.action,
            description: item.description,
            isSystem: true,
            status: PermissionStatus.ACTIVE,
        });

        await permissionRepository.save(permission);
    }
}

async function seedRoles(manager: EntityManager): Promise<void> {
    const roleRepository = manager.getRepository(RoleEntity);

    for (const item of ROLES) {
        const existingRole = await roleRepository.findOne({
            where: {
                code: item.code,
            },
        });

        if (existingRole) {
            existingRole.name = item.name;
            existingRole.description = item.description;
            existingRole.isSystem = true;
            existingRole.status = RoleStatus.ACTIVE;

            await roleRepository.save(existingRole);
            continue;
        }

        const role = roleRepository.create({
            code: item.code,
            name: item.name,
            description: item.description,
            isSystem: true,
            status: RoleStatus.ACTIVE,
        });

        await roleRepository.save(role);
    }
}

async function seedRolePermissions(manager: EntityManager): Promise<void> {
    const roleRepository = manager.getRepository(RoleEntity);
    const permissionRepository = manager.getRepository(PermissionEntity);
    const rolePermissionRepository = manager.getRepository(RolePermissionEntity);

    for (const [roleCode, permissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
        const role = await roleRepository.findOne({
            where: {
                code: roleCode,
            },
        });

        if (!role) {
            throw new Error(`Role not found: ${roleCode}`);
        }

        for (const permissionCode of permissionCodes) {
            const permission = await permissionRepository.findOne({
                where: {
                    code: permissionCode,
                },
            });

            if (!permission) {
                throw new Error(`Permission not found: ${permissionCode}`);
            }

            const existingRolePermission = await rolePermissionRepository.findOne({
                where: {
                    roleId: role.id,
                    permissionId: permission.id,
                },
            });

            if (existingRolePermission) {
                continue;
            }

            const rolePermission = rolePermissionRepository.create({
                roleId: role.id,
                permissionId: permission.id,
            });

            await rolePermissionRepository.save(rolePermission);
        }
    }
}

async function runSeed(): Promise<void> {
    await dataSource.initialize();

    try {
        console.log('Start RBAC seed...');

        await dataSource.transaction(async (manager) => {
            await seedPermissions(manager);
            await seedRoles(manager);
            await seedRolePermissions(manager);
        });

        console.log('RBAC seed completed.');
    } finally {
        await dataSource.destroy();
    }
}

runSeed().catch((error) => {
    console.error('RBAC seed failed:', error);
    process.exit(1);
});