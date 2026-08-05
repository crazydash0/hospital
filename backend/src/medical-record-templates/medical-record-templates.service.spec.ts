import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordTemplatesService } from './medical-record-templates.service';

describe('MedicalRecordTemplatesService', () => {
  let service: MedicalRecordTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalRecordTemplatesService],
    }).compile();

    service = module.get<MedicalRecordTemplatesService>(
      MedicalRecordTemplatesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
