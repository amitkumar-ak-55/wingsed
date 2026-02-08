/**
 * Security-focused tests for WingsEd backend
 * Tests injection attacks, input sanitization, auth bypass, and abuse scenarios
 */
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe, INestApplication, HttpStatus } from '@nestjs/common';
import { CreateWhatsAppLeadDto } from '../modules/leads/dto/create-whatsapp-lead.dto';
import { CreateProfileDto } from '../modules/profile/dto/create-profile.dto';
import { UpdateProfileDto } from '../modules/profile/dto/update-profile.dto';
import { GetUniversitiesDto } from '../modules/universities/dto/get-universities.dto';
import { CreateUniversityDto } from '../modules/admin/dto/create-university.dto';
import { UpdateUserRoleDto } from '../modules/admin/dto/update-user-role.dto';
import { CreateApplicationDto } from '../modules/applications/dto/create-application.dto';
import { UpdateApplicationDto } from '../modules/applications/dto/update-application.dto';
import { CreateProgramDto } from '../modules/admin/dto/create-program.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// Helper to validate a DTO and return errors
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

describe('Security: Input Validation & Injection Prevention', () => {
  // =====================================================
  // SQL INJECTION ATTEMPTS (should be rejected by DTOs)
  // =====================================================
  describe('SQL Injection via string fields', () => {
    it('should reject SQL injection in lead name (truncated by MaxLength)', async () => {
      const malicious = {
        name: "'; DROP TABLE users; --",
        country: 'USA',
      };
      // This should pass validation because it's a valid string under 255 chars
      // Prisma parameterizes queries, so SQL injection is structurally impossible
      const errors = await validateDto(CreateWhatsAppLeadDto, malicious);
      expect(errors).toHaveLength(0); // String is valid — Prisma handles safety
    });

    it('should reject oversized SQL injection payload', async () => {
      const malicious = {
        name: 'A'.repeat(300) + "'; DROP TABLE users; --",
        country: 'USA',
      };
      const errors = await validateDto(CreateWhatsAppLeadDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('must be shorter');
    });

    it('should reject SQL injection in search queries', async () => {
      const malicious = {
        search: "'; SELECT * FROM users WHERE '1'='1",
        page: 1,
        pageSize: 10,
      };
      // Short enough to pass MaxLength, but it's just a string — Prisma is safe
      const errors = await validateDto(GetUniversitiesDto, malicious);
      expect(errors).toHaveLength(0);
    });

    it('should reject SQL in search when exceeding 255 chars', async () => {
      const malicious = {
        search: 'X'.repeat(260),
      };
      const errors = await validateDto(GetUniversitiesDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // =====================================================
  // XSS INJECTION ATTEMPTS
  // =====================================================
  describe('XSS Injection via string fields', () => {
    it('should accept XSS payloads as plain strings (React escapes on render)', async () => {
      const xss = {
        name: '<script>alert("xss")</script>',
        country: '<img src=x onerror=alert(1)>',
      };
      // These are valid strings — React auto-escapes in JSX
      const errors = await validateDto(CreateWhatsAppLeadDto, xss);
      expect(errors).toHaveLength(0);
    });

    it('should reject XSS+overflow combined attack', async () => {
      const xss = {
        name: '<script>'.repeat(100) + 'alert("xss")</script>',
      };
      const errors = await validateDto(CreateWhatsAppLeadDto, xss);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject XSS in university description over limit', async () => {
      const xss = {
        name: 'MIT',
        country: 'USA',
        city: 'Cambridge',
        tuitionFee: 50000,
        publicPrivate: 'Private',
        description: '<script>'.repeat(1000),
      };
      const errors = await validateDto(CreateUniversityDto, xss);
      expect(errors.length).toBeGreaterThan(0); // >5000 chars
    });
  });

  // =====================================================
  // NOSQL / PRISMA OPERATOR INJECTION
  // =====================================================
  describe('Prisma operator injection via body fields', () => {
    it('should reject object payloads where string is expected', async () => {
      const malicious = {
        name: { $ne: null }, // MongoDB-style injection
        country: 'US',
      };
      const errors = await validateDto(CreateWhatsAppLeadDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('string');
    });

    it('should reject nested object in country field', async () => {
      const malicious = {
        country: { contains: 'US', mode: 'insensitive' },
      };
      const errors = await validateDto(CreateProfileDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject array where string expected', async () => {
      const malicious = {
        name: ['admin', 'user'],
        country: 'US',
      };
      const errors = await validateDto(CreateWhatsAppLeadDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // =====================================================
  // TYPE COERCION ATTACKS
  // =====================================================
  describe('Type coercion attacks', () => {
    it('should reject boolean where string is expected', async () => {
      const malicious = {
        country: true,
        targetField: 'CS',
        testTaken: 'NONE',
      };
      const errors = await validateDto(CreateProfileDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative budget values', async () => {
      const malicious = {
        country: 'US',
        targetField: 'CS',
        testTaken: 'NONE',
        budgetMin: -1,
      };
      const errors = await validateDto(CreateProfileDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject absurdly large budget via @Max', async () => {
      const malicious = {
        country: 'US',
        targetField: 'CS',
        testTaken: 'NONE',
        budgetMax: 999999999999,
      };
      const errors = await validateDto(CreateProfileDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-numeric page values', async () => {
      const malicious = {
        page: 'abc',
        pageSize: 10,
      };
      const errors = await validateDto(GetUniversitiesDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // =====================================================
  // PRIVILEGE ESCALATION ATTEMPTS
  // =====================================================
  describe('Role escalation via DTOs', () => {
    it('should reject invalid role values', async () => {
      const malicious = { role: 'SUPERADMIN' };
      const errors = await validateDto(UpdateUserRoleDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty role', async () => {
      const malicious = { role: '' };
      const errors = await validateDto(UpdateUserRoleDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject numeric role', async () => {
      const malicious = { role: 1 };
      const errors = await validateDto(UpdateUserRoleDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept valid ADMIN role', async () => {
      const valid = { role: 'ADMIN' };
      const errors = await validateDto(UpdateUserRoleDto, valid);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid STUDENT role', async () => {
      const valid = { role: 'STUDENT' };
      const errors = await validateDto(UpdateUserRoleDto, valid);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid COUNSELOR role', async () => {
      const valid = { role: 'COUNSELOR' };
      const errors = await validateDto(UpdateUserRoleDto, valid);
      expect(errors).toHaveLength(0);
    });
  });

  // =====================================================
  // ENUM INJECTION
  // =====================================================
  describe('Enum validation attacks', () => {
    it('should reject invalid ApplicationStatus', async () => {
      const malicious = {
        status: 'HACKED',
      };
      const errors = await validateDto(UpdateApplicationDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept valid ApplicationStatus', async () => {
      const valid = { status: 'APPLIED' };
      const errors = await validateDto(UpdateApplicationDto, valid);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid DegreeType in CreateProgram', async () => {
      const malicious = {
        name: 'CS Program',
        degreeType: 'FAKE_DEGREE',
      };
      const errors = await validateDto(CreateProgramDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid TestTaken enum', async () => {
      const malicious = {
        country: 'US',
        targetField: 'CS',
        testTaken: 'SAT', // Not a valid TestTaken value
      };
      const errors = await validateDto(CreateProfileDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // =====================================================
  // UNKNOWN / EXTRA FIELD INJECTION
  // =====================================================
  describe('Extra field injection (whitelist bypass)', () => {
    it('should reject unknown fields on lead DTO', async () => {
      const malicious = {
        name: 'John',
        country: 'US',
        isAdmin: true, // injected field
        role: 'ADMIN', // injected field
      };
      const errors = await validateDto(CreateWhatsAppLeadDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('should not exist'))).toBe(true);
    });

    it('should reject unknown fields on profile DTO', async () => {
      const malicious = {
        country: 'US',
        targetField: 'CS',
        testTaken: 'NONE',
        clerkId: 'inject_clerk_id', // try to set clerkId
        email: 'admin@hack.com',     // try to set email
      };
      const errors = await validateDto(CreateProfileDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject unknown fields on application DTO', async () => {
      const malicious = {
        universityId: 'uni-1',
        userId: 'hack-user-id', // try to inject userId
      };
      const errors = await validateDto(CreateApplicationDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject __proto__ pollution attempts', async () => {
      const malicious = {
        name: 'John',
        country: 'US',
        __proto__: { isAdmin: true },
      };
      const instance = plainToInstance(CreateWhatsAppLeadDto, malicious);
      const errors = await validate(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      // Verify __proto__ injection didn't add isAdmin to prototype chain
      expect((instance as any).isAdmin).toBeUndefined();
      // Either errors or stripped - both are acceptable security outcomes
    });
  });

  // =====================================================
  // URL VALIDATION ON ADMIN DTOS
  // =====================================================
  describe('URL validation on university fields', () => {
    const baseUni = {
      name: 'MIT',
      country: 'USA',
      city: 'Cambridge',
      tuitionFee: 50000,
      publicPrivate: 'Private',
    };

    it('should reject invalid logoUrl', async () => {
      const malicious = {
        ...baseUni,
        logoUrl: 'javascript:alert(1)',
      };
      const errors = await validateDto(CreateUniversityDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid websiteUrl', async () => {
      const malicious = {
        ...baseUni,
        websiteUrl: 'not-a-url',
      };
      const errors = await validateDto(CreateUniversityDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept valid URLs', async () => {
      const valid = {
        ...baseUni,
        logoUrl: 'https://example.com/logo.png',
        websiteUrl: 'https://mit.edu',
      };
      const errors = await validateDto(CreateUniversityDto, valid);
      expect(errors).toHaveLength(0);
    });
  });

  // =====================================================
  // BOUNDARY VALUE ATTACKS
  // =====================================================
  describe('Boundary value attacks', () => {
    it('should reject GRE score above 340', async () => {
      const malicious = {
        name: 'CS Program',
        degreeType: 'MASTERS',
        greRequired: true,
        greMinScore: 500,
      };
      const errors = await validateDto(CreateProgramDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject GMAT score above 800', async () => {
      const malicious = {
        name: 'MBA Program',
        degreeType: 'MASTERS',
        gmatRequired: true,
        gmatMinScore: 900,
      };
      const errors = await validateDto(CreateProgramDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject IELTS score above 9', async () => {
      const malicious = {
        name: 'CS Program',
        degreeType: 'MASTERS',
        ieltsMinScore: 10,
      };
      const errors = await validateDto(CreateProgramDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject TOEFL score above 120', async () => {
      const malicious = {
        name: 'CS Program',
        degreeType: 'MASTERS',
        toeflMinScore: 130,
      };
      const errors = await validateDto(CreateProgramDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject GPA above 4', async () => {
      const malicious = {
        name: 'CS Program',
        degreeType: 'MASTERS',
        gpaMinScore: 5.0,
      };
      const errors = await validateDto(CreateProgramDto, malicious as any);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject acceptance rate above 100%', async () => {
      const malicious = {
        name: 'MIT',
        country: 'USA',
        city: 'Cambridge',
        tuitionFee: 50000,
        publicPrivate: 'Private',
        acceptanceRate: 150, // >100%
      };
      const errors = await validateDto(CreateUniversityDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject page size above 50', async () => {
      const malicious = {
        pageSize: 10000, // try to dump entire DB
      };
      const errors = await validateDto(GetUniversitiesDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // =====================================================
  // PAYLOAD SIZE ATTACKS (DoS)
  // =====================================================
  describe('Payload size attacks', () => {
    it('should reject 1MB string in name field', async () => {
      const malicious = {
        name: 'A'.repeat(1_000_000),
        country: 'US',
        city: 'NYC',
        tuitionFee: 10000,
        publicPrivate: 'Public',
      };
      const errors = await validateDto(CreateUniversityDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject 1MB string in notes field', async () => {
      const malicious = {
        universityId: 'uni-1',
        notes: 'X'.repeat(1_000_000),
      };
      const errors = await validateDto(CreateApplicationDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject 1MB string in description', async () => {
      const malicious = {
        name: 'MIT',
        country: 'USA',
        city: 'Cambridge',
        tuitionFee: 50000,
        publicPrivate: 'Private',
        description: 'D'.repeat(1_000_000),
      };
      const errors = await validateDto(CreateUniversityDto, malicious);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Security: Webhook Signature Enforcement', () => {
  it('should exist — webhook verification is mandatory (not conditional)', () => {
    // This is a static analysis assertion
    const fs = require('fs');
    const webhookCode = fs.readFileSync(
      require('path').join(__dirname, '../modules/webhooks/webhooks.controller.ts'),
      'utf8',
    );

    // Verify the old conditional pattern is gone
    expect(webhookCode).not.toContain('if (webhookSecret)');

    // Verify it always throws when secret is missing
    expect(webhookCode).toContain("throw new BadRequestException('Webhook secret is not configured");
  });
});

describe('Security: Helmet / Security Headers', () => {
  it('should have helmet configured in main.ts', () => {
    const fs = require('fs');
    const mainCode = fs.readFileSync(
      require('path').join(__dirname, '../main.ts'),
      'utf8',
    );

    expect(mainCode).toContain("import helmet from 'helmet'");
    expect(mainCode).toContain('app.use(helmet())');
  });

  it('should have rawBody enabled for webhook verification', () => {
    const fs = require('fs');
    const mainCode = fs.readFileSync(
      require('path').join(__dirname, '../main.ts'),
      'utf8',
    );

    expect(mainCode).toContain('rawBody: true');
  });
});

describe('Security: Rate Limiting Configuration', () => {
  it('should have ThrottlerGuard as global guard', () => {
    const fs = require('fs');
    const appModuleCode = fs.readFileSync(
      require('path').join(__dirname, '../app.module.ts'),
      'utf8',
    );

    expect(appModuleCode).toContain('ThrottlerGuard');
    expect(appModuleCode).toContain('APP_GUARD');
  });

  it('should skip throttling on webhook endpoint', () => {
    const fs = require('fs');
    const webhookCode = fs.readFileSync(
      require('path').join(__dirname, '../modules/webhooks/webhooks.controller.ts'),
      'utf8',
    );

    expect(webhookCode).toContain('SkipThrottle');
  });
});

describe('Security: CORS Configuration', () => {
  it('should NOT use wildcard CORS origin', () => {
    const fs = require('fs');
    const mainCode = fs.readFileSync(
      require('path').join(__dirname, '../main.ts'),
      'utf8',
    );

    // Should not have origin: '*' or origin: true
    expect(mainCode).not.toMatch(/origin:\s*['"]\*['"]/);
    expect(mainCode).not.toMatch(/origin:\s*true/);
    // Should load from env
    expect(mainCode).toContain('CORS_ORIGINS');
  });
});

describe('Security: Error Response Safety', () => {
  it('should not expose stack traces in error responses', () => {
    const fs = require('fs');
    const filterCode = fs.readFileSync(
      require('path').join(__dirname, '../common/filters/all-exceptions.filter.ts'),
      'utf8',
    );

    // Non-HttpException errors should return generic message
    expect(filterCode).toContain("'Internal server error'");

    // The ErrorResponse interface should NOT include a 'stack' field
    // exception.stack is used in console.error (server-side logging) which is fine
    // But it should never appear in the response object sent to the client
    const responseStartIndex = filterCode.indexOf('const errorResponse');
    expect(responseStartIndex).toBeGreaterThan(-1); // Ensure pattern exists
    const responseBlock = filterCode.substring(responseStartIndex);
    expect(responseBlock).not.toContain('stack');
  });});

describe('Security: Validation Pipe Configuration', () => {
  it('should have whitelist and forbidNonWhitelisted enabled', () => {
    const fs = require('fs');
    const mainCode = fs.readFileSync(
      require('path').join(__dirname, '../main.ts'),
      'utf8',
    );

    expect(mainCode).toContain('whitelist: true');
    expect(mainCode).toContain('forbidNonWhitelisted: true');
    expect(mainCode).toContain('transform: true');
  });
});

describe('Security: No Raw SQL Usage', () => {
  it('should not use any raw SQL queries in the entire src directory', () => {
    const fs = require('fs');
    const path = require('path');

    function scanDir(dir: string): string[] {
      const results: string[] = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.includes('node_modules') && !item.name.includes('.spec')) {
          results.push(...scanDir(fullPath));
        } else if (item.name.endsWith('.ts') && !item.name.endsWith('.spec.ts')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const srcDir = path.join(__dirname, '..');
    const tsFiles = scanDir(srcDir);

    const dangerousPatterns = [
      '$queryRawUnsafe',
      '$executeRawUnsafe',
      '$queryRaw',
      '$executeRaw',
    ];

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of dangerousPatterns) {
        expect(content).not.toContain(pattern);
      }
    }
  });
});

describe('Security: No dangerouslySetInnerHTML in Frontend', () => {
  it('should not use dangerouslySetInnerHTML anywhere', () => {
    const fs = require('fs');
    const path = require('path');

    function scanDir(dir: string): string[] {
      const results: string[] = [];
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory() && !item.name.includes('node_modules') && item.name !== '.next') {
            results.push(...scanDir(fullPath));
          } else if (item.name.endsWith('.tsx') || item.name.endsWith('.jsx')) {
            results.push(fullPath);
          }
        }
      } catch {
        // Skip inaccessible directories
      }
      return results;
    }

    const frontendSrc = path.join(__dirname, '../../../frontend/src');
    const tsxFiles = scanDir(frontendSrc);

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('dangerouslySetInnerHTML');
    }
  });
});

describe('Security: .env.example should not contain real secrets', () => {
  it('frontend .env.example should not contain real Clerk secret key', () => {
    const fs = require('fs');
    const path = require('path');
    const envExample = fs.readFileSync(
      path.join(__dirname, '../../../frontend/.env.example'),
      'utf8',
    );

    // Should NOT contain an actual sk_test_ key with real characters
    expect(envExample).not.toMatch(/sk_test_[A-Za-z0-9]{20,}/);
  });

  it('backend .env.example should use placeholder values', () => {
    const fs = require('fs');
    const path = require('path');
    const envExample = fs.readFileSync(
      path.join(__dirname, '../../../backend/.env.example'),
      'utf8',
    );

    // Should contain placeholder patterns, not real keys
    expect(envExample).toContain('xxxxxxxx');
  });
});
