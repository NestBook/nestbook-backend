import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity, UserStatus } from '../../modules/user/entities/user.entity';
import { AuthEntity, AuthProvider } from '../../modules/auth/entities/auth.entity';
import { RoleEntity } from '../../modules/role/entities/role.entity';
import { UserRoleEntity } from '../../modules/user/entities/user-role.entity';
import { LoggerService } from '../../infrastructures/logger/logger.service';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,

        private readonly logger: LoggerService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        const fullName = process.env.ADMIN_FULL_NAME ?? 'System Admin';
        const mfaSecret = process.env.ADMIN_MFA_SECRET ?? null;

        if (!email || !password) {
            this.logger.log(
                'ADMIN_EMAIL or ADMIN_PASSWORD not configured — skipping admin seed',
                'AdminSeeder',
            );
            return;
        }

        try {
            const userRepo = this.dataSource.getRepository(UserEntity);
            const authRepo = this.dataSource.getRepository(AuthEntity);
            const roleRepo = this.dataSource.getRepository(RoleEntity);
            const userRoleRepo = this.dataSource.getRepository(UserRoleEntity);

            const existing = await userRepo.findOne({ where: { email } });
            if (existing) {
                this.logger.log(`Admin already exists: ${email}`, 'AdminSeeder');
                return;
            }

            const adminRole = await roleRepo.findOne({ where: { code: 'ADMIN' } });
            if (!adminRole) {
                this.logger.error(
                    'ADMIN role not found — run RBAC seed (npm run seed:rbac) first',
                    'AdminSeeder',
                );
                return;
            }

            await this.dataSource.transaction(async (manager) => {
                const user = manager.create(UserEntity, {
                    email,
                    fullName,
                    phone: null,
                    status: UserStatus.ACTIVE,
                });
                await manager.save(UserEntity, user);

                const passwordHash = await bcrypt.hash(password, 10);
                const auth = manager.create(AuthEntity, {
                    userId: user.id,
                    provider: AuthProvider.LOCAL,
                    providerId: null,
                    passwordHash,
                    mfaEnabled: !!mfaSecret,
                    mfaSecret,
                    passwordChangedAt: new Date(),
                    lastLoginAt: null,
                });
                await manager.save(AuthEntity, auth);

                const userRole = manager.create(UserRoleEntity, {
                    userId: user.id,
                    roleId: adminRole.id,
                });
                await manager.save(UserRoleEntity, userRole);
            });

            this.logger.log(
                `Default admin created: ${email} (MFA ${mfaSecret ? 'enabled' : 'disabled'})`,
                'AdminSeeder',
            );
        } catch (error) {
            this.logger.error(`Admin seed failed: ${String(error)}`, 'AdminSeeder');
        }
    }
}
