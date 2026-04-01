import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { TagController } from './tag.controller';
import { Tag } from './tag.entity';
import { TagService } from './tag.service';

@Module({
  imports: [MikroOrmModule.forFeature([Tag])],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
