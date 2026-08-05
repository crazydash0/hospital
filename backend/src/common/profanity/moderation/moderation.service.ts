import { Injectable } from '@nestjs/common';

import { ModerationAction } from './enums/moderation-action.enum';
import { ModerationResult } from './interfaces/moderation-result.interface';

import { NormalizerService } from './services/normalizer.service';
import { DictionaryFilterService } from './services/dictionary-filter.service';
import { LeoProfanityService } from './services/leo-profanity.service';

@Injectable()
export class ModerationService {
  constructor(
    private readonly normalizer: NormalizerService,
    private readonly dictionary: DictionaryFilterService,
    private readonly leo: LeoProfanityService,
  ) {}

  async moderate(text: string): Promise<ModerationResult> {
    const normalized = this.normalizer.normalize(text);

    // Arabic Dictionary
    if (this.dictionary.containsBadWords(normalized)) {
      return {
        action: ModerationAction.REJECT,
        originalText: text,
        normalizedText: normalized,
        reason: 'Comment contains inappropriate language.',
      };
    }

    // English Dictionary (Leo)
    if (this.leo.containsProfanity(normalized)) {
      return {
        action: ModerationAction.REJECT,
        originalText: text,
        normalizedText: normalized,
        reason: 'Comment contains inappropriate language.',
      };
    }

    // AI هيضاف هنا لاحقًا

    return {
      action: ModerationAction.ALLOW,
      originalText: text,
      normalizedText: normalized,
    };
  }
}
