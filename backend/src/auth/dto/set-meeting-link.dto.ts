import { IsString, MinLength, MaxLength } from 'class-validator';

export class SetMeetingLinkDto {
  @IsString()
  @MinLength(5, { message: 'الرابط قصير جدًا' })
  @MaxLength(500)
  meetingLink!: string;
}
