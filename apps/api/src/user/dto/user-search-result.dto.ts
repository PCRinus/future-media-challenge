import { ApiProperty } from '@nestjs/swagger';

export class UserSearchResultDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  username!: string;
}
