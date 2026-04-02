import { defineEntity, p } from '@mikro-orm/core';
import { v7 } from 'uuid';

import { Message } from '../message/message.entity';

const UserSchema = defineEntity({
  name: 'User',
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => v7()),
    username: p.string().unique(),
    email: p.string().unique(),
    passwordHash: p.string().hidden(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
    messages: () => p.oneToMany(Message).mappedBy('author'),
  },
});

export class User extends UserSchema.class {}
UserSchema.setClass(User);
