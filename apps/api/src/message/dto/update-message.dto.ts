import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateMessageDto {
  @ApiPropertyOptional({ example: 'Updated content', maxLength: 240 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(240)
  content?: string;

  @ApiPropertyOptional({ example: '019d4a4e-8054-71b8-af3b-bd3c39d15719' })
  @IsOptional()
  @IsUUID()
  tagId?: string;
}
