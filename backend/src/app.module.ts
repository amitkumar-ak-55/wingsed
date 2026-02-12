import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

// Modules
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UniversitiesModule } from './modules/universities/universities.module';
import { LeadsModule } from './modules/leads/leads.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

import { SavedUniversitiesModule } from './modules/saved-universities/saved-universities.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AdminModule } from './modules/admin/admin.module';

// Common
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting: 100 requests per 15 minutes per IP
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 900000), // 15 minutes in ms
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // Database
    PrismaModule,

    // Feature Modules
    UsersModule,
    ProfileModule,
    UniversitiesModule,
    LeadsModule,
    WebhooksModule,

    SavedUniversitiesModule,
    ApplicationsModule,
    AdminModule,
  ],
  providers: [
    // Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
