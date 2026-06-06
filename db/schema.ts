import { pgTable, uuid, text, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull(),
  usernameLower: text('username_lower').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  salt: text('salt').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  token: text('token').primaryKey(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  adminId: uuid('admin_id').notNull(),
  linkEnabled: boolean('link_enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const groupMembers = pgTable(
  'group_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('group_id').notNull(),
    userId: uuid('user_id').notNull(),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (t) => ({ uniqMember: unique().on(t.groupId, t.userId) }),
);

export const predictions = pgTable(
  'predictions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    matchId: text('match_id').notNull(),
    home: integer('home').notNull(),
    away: integer('away').notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({ uniqPred: unique().on(t.userId, t.matchId) }),
);

export const bonusPredictions = pgTable('bonus_predictions', {
  userId: uuid('user_id').primaryKey(),
  winner: text('winner').notNull().default(''),
  topScorer: text('top_scorer').notNull().default(''),
});

export const results = pgTable('results', {
  matchId: text('match_id').primaryKey(),
  home: integer('home').notNull(),
  away: integer('away').notNull(),
  status: text('status').notNull().default('finished'),
  manual: boolean('manual').notNull().default(false),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
