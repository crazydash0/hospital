import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordTemplatesController } from './medical-record-templates.controller';

describe('MedicalRecordTemplatesController', () => {
  let controller: MedicalRecordTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalRecordTemplatesController],
    }).compile();

    controller = module.get<MedicalRecordTemplatesController>(
      MedicalRecordTemplatesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
