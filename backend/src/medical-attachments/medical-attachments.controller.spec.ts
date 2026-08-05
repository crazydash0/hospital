import { Test, TestingModule } from '@nestjs/testing';
import { MedicalAttachmentsController } from './medical-attachments.controller';

describe('MedicalAttachmentsController', () => {
  let controller: MedicalAttachmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalAttachmentsController],
    }).compile();

    controller = module.get<MedicalAttachmentsController>(
      MedicalAttachmentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
