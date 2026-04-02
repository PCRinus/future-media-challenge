import { MikroORM } from '@mikro-orm/core';
import * as argon2 from 'argon2';

import { Message } from './message/message.entity';
import mikroOrmConfig from './mikro-orm.config';
import { Tag } from './tag/tag.entity';
import { User } from './user/user.entity';

const TAG_NAMES = ['General', 'Tech', 'Random', 'News', 'Humor'];

const USERS = [
  { username: 'alice', email: 'alice@example.com', password: 'password123' },
  { username: 'bob', email: 'bob@example.com', password: 'password123' },
  { username: 'charlie', email: 'charlie@example.com', password: 'password123' },
];

const MESSAGES = [
  'Just joined this platform, excited to be here!',
  'Has anyone tried the new TypeScript 6.0 features?',
  'Random thought: pineapple on pizza is actually great.',
  'Breaking: AI models can now write better code than most humans.',
  'Why did the developer go broke? Because he used up all his cache.',
  'Docker containers are like apartments for your apps.',
  'Hot take: tabs are better than spaces. Fight me.',
  'Just deployed my first NestJS app to production!',
  'TIL that MikroORM v7 has an amazing new defineEntity API.',
  'Weekend project idea: build a CLI tool in Rust.',
  'The best error message is the one the user never sees.',
  'PostgreSQL > MySQL, and I will die on this hill.',
  'Anyone else addicted to cursor-based pagination?',
  'My cat just walked across my keyboard and committed to main.',
  'Remember when we used to FTP files to deploy? Good times.',
  'GraphQL is cool but REST is still king for most use cases.',
  'Node.js 24 performance improvements are insane.',
  'Every developer should learn how to read a flamegraph.',
  'Unpopular opinion: monorepos make everything simpler.',
  'Just found a bug that was introduced 3 years ago. Classic.',
  'The frontend is loading... still loading... still loading...',
  'Wrote 500 lines of code today. Deleted 600. Net positive.',
  'Friendly reminder to back up your databases.',
  'CSS grid changed my life. No more float hacks.',
  'Code review tip: be kind, be specific, be constructive.',
  'Is it just me or does every npm package have 47 dependencies?',
  'Automated testing saved my bacon today.',
  'Productivity hack: close Slack and write code.',
  "The cloud is just someone else's computer, running your bugs.",
  'Who needs sleep when you have caffeine and deadlines?',
  'New personal record: zero console.log statements in production.',
  'If debugging is removing bugs, then programming is adding them.',
  'Pair programming: because two confused developers are better than one.',
  "Just refactored a 2000-line file into 15 modules. Chef's kiss.",
  'Today I mass-learned that YAML indentation matters. The hard way.',
];

async function seed() {
  const orm = await MikroORM.init(mikroOrmConfig);
  const em = orm.em.fork();

  try {
    // Seed tags (idempotent)
    const tags: Tag[] = [];
    for (const name of TAG_NAMES) {
      let tag = await em.findOne(Tag, { name });
      if (!tag) {
        tag = em.create(Tag, { name });
      }
      tags.push(tag);
    }
    await em.flush();

    // Seed users (idempotent)
    const users: User[] = [];
    for (const { username, email, password } of USERS) {
      let user = await em.findOne(User, { email });
      if (!user) {
        const passwordHash = await argon2.hash(password);
        user = em.create(User, { username, email, passwordHash });
      }
      users.push(user);
    }
    await em.flush();

    // Seed messages (idempotent — skip if messages already exist)
    const existingCount = await em.count(Message);
    if (existingCount === 0) {
      const baseDate = new Date('2026-03-01T10:00:00Z');

      for (let i = 0; i < MESSAGES.length; i++) {
        const author = users[i % users.length];
        const tag = tags[i % tags.length];
        const createdAt = new Date(
          baseDate.getTime() + i * 30 * 60 * 1000, // 30 min apart
        );

        em.create(Message, {
          content: MESSAGES[i],
          author,
          tag,
          createdAt,
          updatedAt: createdAt,
        });
      }
      await em.flush();
      console.log(`Seeded ${MESSAGES.length} messages.`);
    } else {
      console.log(`Skipping messages — ${existingCount} already exist.`);
    }

    console.log(`Seed complete: ${tags.length} tags, ${users.length} users.`);
  } finally {
    await orm.close();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
