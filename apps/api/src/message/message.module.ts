import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { TagModule } from '../tag/tag.module';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { MessageService } from './message.service';

@Module({
  imports: [MikroOrmModule.forFeature([Message]), TagModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
