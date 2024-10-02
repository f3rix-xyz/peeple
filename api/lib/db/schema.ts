import {
  pgTableCreator,
  varchar,
  timestamp,
  serial,
  text,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator(
  (name: string): string => `peeple_api_${name.toLowerCase()}`,
);

export const users = createTable("users", {
  id: varchar("id").primaryKey(),
  name: varchar("name"),
  email: varchar("email").unique().notNull(),
  location: varchar("location", { length: 255 }),
  gender: varchar("gender"),
  relationshiptype: varchar("relationshiptype"),
  height: integer("height"),
  religion: varchar("religion"),
  occupationField: varchar("occupation_field", { length: 255 }), // Corresponds to field
  occupationArea: varchar("occupation_area"),
  drink: varchar("drink"),
  smoke: varchar("smoke"),
  bio: text("bio"),
  date: integer("date"),
  month: integer("month"),
  year: integer("year"),
  subscription: varchar("subscription").default("free"),
  instaId: varchar("instaid"),
  phone: varchar("phone"),
});

export type User = typeof users.$inferSelect;

export const pictures = createTable("pictures", {
  id: serial("id").primaryKey(),
  email: varchar("email")
    .references(() => users.email)
    .notNull(),
  url: varchar("url").notNull(),
});

export const likes = createTable("likes", {
  id: serial("id").primaryKey(),
  likerEmail: varchar("likerEmail")
    .references(() => users.email)
    .notNull(),
  likedEmail: varchar("likedEmail")
    .references(() => users.email)
    .notNull(),
});

export const matches = createTable("matches", {
  id: serial("id").primaryKey(),
  user1id: varchar("user1id")
    .references(() => users.id)
    .notNull(),
  user2id: varchar("user2id")
    .references(() => users.id)
    .notNull(),
  matchedat: timestamp("matchedat").defaultNow().notNull(),
});

export const messages = createTable("messages", {
  id: serial("id").primaryKey(),
  senderEmail: varchar("senderEmail")
    .references(() => users.email)
    .notNull(),
  receiverEmail: varchar("receiverEmail")
    .references(() => users.email)
    .notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sentat").defaultNow().notNull(),
  isRead: boolean("isread").default(false),
});

export const userpreferences = createTable("userpreferences", {
  id: serial("id").primaryKey(),
  userid: varchar("userid")
    .references(() => users.id)
    .notNull(),
  agerange: jsonb("agerange"),
  genderpreference: jsonb("genderpreference"),
  relationshiptypepreference: jsonb("relationshiptypepreference"),
  maxdistance: integer("maxdistance"),
});

export const profileImages = createTable("profileImages", {
  id: serial("id").primaryKey(),
  email: varchar("email")
    .references(() => users.email)
    .notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  imageName: varchar("name", { length: 255 }).notNull(),
  imageNo: integer("imageNo").notNull(),
});
