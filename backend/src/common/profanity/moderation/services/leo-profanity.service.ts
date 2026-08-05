import { Injectable } from '@nestjs/common';
import * as LeoProfanity from 'leo-profanity';

@Injectable()
export class LeoProfanityService {
  constructor() {
    LeoProfanity.loadDictionary();
  }

  containsProfanity(text: string): boolean {
    return LeoProfanity.check(text);
  }
}
