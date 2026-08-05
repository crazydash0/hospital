import { Injectable } from '@nestjs/common';
import * as LeoProfanity from 'leo-profanity';

@Injectable()
export class AiModerationService {}
LeoProfanity.loadDictionary();
