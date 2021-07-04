import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {
  @PrimaryKey()
  id!: number;

  @Property({ type: "text" })
  title!: String;

  @Property({ type: "date" })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), type: "date" })
  updatedAt: Date = new Date();
}