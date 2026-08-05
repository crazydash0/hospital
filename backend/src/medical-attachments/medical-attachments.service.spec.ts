import { Test, TestingModule } from '@nestjs/testing';
import { MedicalAttachmentsService } from './medical-attachments.service';

describe('MedicalAttachmentsService', () => {
  let service: MedicalAttachmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalAttachmentsService],
    }).compile();

    service = module.get<MedicalAttachmentsService>(MedicalAttachmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
