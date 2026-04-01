import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import mikroOrmConfig from './mikro-orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    MikroOrmModule.forRoot({
      ...mikroOrmConfig,
      autoLoadEntities: true,
      discovery: { warnWhenNoEntities: false },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
