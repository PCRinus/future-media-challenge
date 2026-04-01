import { defineEntity, p } from '@mikro-orm/core';
import { v7 } from 'uuid';

import { Tag } from '../tag/tag.entity';
import { User } from '../user/user.entity';

const MessageSchema = defineEntity({
  name: 'Message',
  indexes: [{ properties: ['createdAt', 'id'] }],
  properties: {
    id: p.uuid().primary().onCreate(() => v7()),
    content: p.string().length(240),
    author: () => p.manyToOne(User),
    tag: () => p.manyToOne(Tag),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export class Message extends MessageSchema.class {}
MessageSchema.setClass(Message);
