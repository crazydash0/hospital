import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProfanityModule } from '../common/profanity/profanity.module';
import { ModerationModule } from '../common/profanity/moderation/moderation.module';
import { AccessControlModule } from '../common/profanity/access-control/access-control.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProfanityModule,
    ModerationModule,
    AccessControlModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
