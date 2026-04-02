import { defineEntity, p } from '@mikro-orm/core';
import { v7 } from 'uuid';

import { Message } from '../message/message.entity';

const TagSchema = defineEntity({
  name: 'Tag',
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => v7()),
    name: p.string().unique(),
    createdAt: p.datetime().onCreate(() => new Date()),
    messages: () => p.oneToMany(Message).mappedBy('tag'),
  },
});

export class Tag extends TagSchema.class {}
TagSchema.setClass(Tag);
