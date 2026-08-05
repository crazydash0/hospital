import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfanityService {
  private readonly bannedWords = ['كلمة1', 'كلمة2', 'كلمة3', 'badword'];

  containsProfanity(text: string): boolean {
    const normalized = text.toLowerCase();

    return this.bannedWords.some((word) =>
      normalized.includes(word.toLowerCase()),
    );
  }

  sanitize(text: string): string {
    let result = text;

    this.bannedWords.forEach((word) => {
      const regex = new RegExp(word, 'gi');

      result = result.replace(regex, '*'.repeat(word.length));
    });

    return result;
  }
}
