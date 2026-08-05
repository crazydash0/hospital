import { ModerationAction } from '../enums/moderation-action.enum';

export interface ModerationResult {
  action: ModerationAction;

  originalText: string;

  normalizedText: string;

  reason?: string;

  score?: number;
}
