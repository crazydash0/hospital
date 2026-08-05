import { Module } from '@nestjs/common';

import { ModerationService } from './moderation.service';

import { NormalizerService } from './services/normalizer.service';
import { DictionaryFilterService } from './services/dictionary-filter.service';
import { AiModerationService } from './services/ai-moderation.service';
import { LeoProfanityService } from './services/leo-profanity.service';

@Module({
  providers: [
    ModerationService,
    NormalizerService,
    DictionaryFilterService,
    AiModerationService,
    LeoProfanityService,
  ],

  exports: [ModerationService],
})
export class ModerationModule {}
