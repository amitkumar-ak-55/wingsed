import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WhatsAppLead } from '@prisma/client';
import { CreateWhatsAppLeadDto } from './dto/create-whatsapp-lead.dto';

@Injectable()
export class LeadsService {
  private whatsappNumber: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.whatsappNumber = this.configService.get<string>(
      'WHATSAPP_PHONE_NUMBER',
      '918658805653',
    );
  }

  /**
   * Create a WhatsApp lead before redirect
   */
  async createLead(
    clerkId: string,
    email: string,
    dto: CreateWhatsAppLeadDto,
  ): Promise<{ lead: WhatsAppLead; redirectUrl: string }> {
    // Build WhatsApp message
    const messageParts: string[] = [];
    
    if (dto.name) {
      messageParts.push(`Hi I am ${dto.name}`);
    } else {
      messageParts.push('Hi');
    }
    
    if (dto.country) {
      messageParts.push(`I want to study in ${dto.country}`);
    }
    
    if (dto.budgetMin || dto.budgetMax) {
      if (dto.budgetMin && dto.budgetMax) {
        messageParts.push(`within a budget of ₹${dto.budgetMin.toLocaleString()} - ₹${dto.budgetMax.toLocaleString()}`);
      } else if (dto.budgetMax) {
        messageParts.push(`within a budget of up to ₹${dto.budgetMax.toLocaleString()}`);
      }
    }

    if (dto.targetField) {
      messageParts.push(`I'm interested in ${dto.targetField}`);
    }

    const messageText = messageParts.join('. ') + '.';
    const encodedMessage = encodeURIComponent(messageText);
    const redirectUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

    // Create lead record
    const lead = await this.prisma.whatsAppLead.create({
      data: {
        clerkId,
        email,
        name: dto.name,
        country: dto.country,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        targetField: dto.targetField,
        messageText,
      },
    });

    // Also update the student profile with WhatsApp redirect timestamp
    await this.prisma.user.findUnique({
      where: { clerkId },
      include: { studentProfile: true },
    }).then(async (user) => {
      if (user?.studentProfile) {
        await this.prisma.studentProfile.update({
          where: { id: user.studentProfile.id },
          data: { whatsAppRedirectAt: new Date() },
        });
      }
    });

    return { lead, redirectUrl };
  }

  /**
   * Update lead with feedback
   */
  async updateFeedback(
    id: string,
    feedback: 'connected' | 'no_response',
  ): Promise<WhatsAppLead> {
    return this.prisma.whatsAppLead.update({
      where: { id },
      data: {
        feedback,
        feedbackAt: new Date(),
      },
    });
  }

  /**
   * Get leads by user
   */
  async getLeadsByUser(clerkId: string): Promise<WhatsAppLead[]> {
    return this.prisma.whatsAppLead.findMany({
      where: { clerkId },
      orderBy: { redirectedAt: 'desc' },
    });
  }

  /**
   * Get leads pending feedback (for 24h follow-up)
   * This is placeholder logic - in production, use a job scheduler
   */
  async getLeadsPendingFeedback(): Promise<WhatsAppLead[]> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return this.prisma.whatsAppLead.findMany({
      where: {
        redirectedAt: { lte: twentyFourHoursAgo },
        feedback: null,
      },
    });
  }

  // ===========================================
  // 24-HOUR FOLLOW-UP LOGIC (PLACEHOLDER)
  // ===========================================
  // TODO: Implement actual job scheduling with Bull/BullMQ + Redis
  // 
  // The flow would be:
  // 1. When a lead is created, schedule a job to run in 24 hours
  // 2. The job sends an email/notification asking about connection status
  // 3. User clicks link to update status (connected/no_response)
  // 
  // Example implementation with Bull:
  // 
  // import { Queue } from 'bull';
  // 
  // @Injectable()
  // export class LeadsService {
  //   constructor(@InjectQueue('leads') private leadsQueue: Queue) {}
  // 
  //   async createLead(...) {
  //     const lead = await this.prisma.whatsAppLead.create(...);
  //     
  //     // Schedule 24h follow-up
  //     await this.leadsQueue.add('follow-up', { leadId: lead.id }, {
  //       delay: 24 * 60 * 60 * 1000, // 24 hours in ms
  //     });
  //     
  //     return lead;
  //   }
  // }
  // ===========================================
}
