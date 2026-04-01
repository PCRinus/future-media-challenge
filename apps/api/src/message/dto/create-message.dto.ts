import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 'Hello world!', maxLength: 240 })
  @IsString()
  @MinLength(1)
  @MaxLength(240)
  content!: string;

  @ApiProperty({ example: '019d4a4e-8054-71b8-af3b-bd3c39d15719' })
  @IsUUID()
  tagId!: string;
}
