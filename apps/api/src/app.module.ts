import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { MessageModule } from './message/message.module';
import mikroOrmConfig from './mikro-orm.config';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    MikroOrmModule.forRoot({
      ...mikroOrmConfig,
      entities: [],
      entitiesTs: [],
      autoLoadEntities: true,
    }),
    UserModule,
    AuthModule,
    HealthModule,
    TagModule,
    MessageModule,
  ],
})
export class AppModule {}
