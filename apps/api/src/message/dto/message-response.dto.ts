import { ApiProperty } from '@nestjs/swagger';

import { TagResponseDto } from '../../tag/dto/tag-response.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class MessageAuthorDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  username!: string;
}

export class MessageTagDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;
}

export class MessageResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ maxLength: 240 })
  content!: string;

  @ApiProperty({ type: MessageAuthorDto })
  author!: MessageAuthorDto;

  @ApiProperty({ type: MessageTagDto })
  tag!: MessageTagDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedMessagesResponseDto {
  @ApiProperty({ type: [MessageResponseDto] })
  items!: MessageResponseDto[];

  @ApiProperty({ nullable: true, type: String })
  nextCursor!: string | null;

  @ApiProperty()
  hasMore!: boolean;
}
