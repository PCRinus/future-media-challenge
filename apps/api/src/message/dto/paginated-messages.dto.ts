import { ApiProperty } from '@nestjs/swagger';

export class PaginatedMessagesDto<T> {
  @ApiProperty()
  items!: T[];

  @ApiProperty({ nullable: true })
  nextCursor!: string | null;

  @ApiProperty()
  hasMore!: boolean;
}
