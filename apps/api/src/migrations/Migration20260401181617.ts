import { Migration } from '@mikro-orm/migrations';

export class Migration20260401181617 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "tag" ("id" uuid not null, "name" varchar(255) not null, "created_at" timestamptz not null, primary key ("id"));`,
    );
    this.addSql(`alter table "tag" add constraint "tag_name_unique" unique ("name");`);

    this.addSql(
      `create table "user" ("id" uuid not null, "username" varchar(255) not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );
    this.addSql(`alter table "user" add constraint "user_username_unique" unique ("username");`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(
      `create table "message" ("id" uuid not null, "content" varchar(240) not null, "author_id" uuid not null, "tag_id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );
    this.addSql(`create index "message_created_at_id_index" on "message" ("created_at", "id");`);

    this.addSql(
      `alter table "message" add constraint "message_author_id_foreign" foreign key ("author_id") references "user" ("id");`,
    );
    this.addSql(
      `alter table "message" add constraint "message_tag_id_foreign" foreign key ("tag_id") references "tag" ("id");`,
    );
  }
}
