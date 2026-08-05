import { Injectable } from '@nestjs/common';

@Injectable()
export class NormalizerService {
  normalize(text: string): string {
    let normalized = text;

    normalized = normalized.toLowerCase();
    normalized = normalized.replace(/[\u064B-\u065F]/g, '');
    normalized = normalized
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه');
    normalized = normalized.replace(/[^\p{L}\p{N}\s]/gu, '');

    normalized = normalized.replace(/\s+/g, '');
    normalized = normalized.replace(/(.)\1{2,}/g, '$1');
    return normalized.trim();
  }
}
