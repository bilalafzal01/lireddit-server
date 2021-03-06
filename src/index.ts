import "reflect-metadata";
import express from "express";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import mikroOrmConfig from "./mikro-orm.config";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { __prod__ } from "./constants";
import { MyContext } from "./types";

// declare module "express-session" {
//   export interface SessionData {
//     userId: number;
//   }
// }

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid", // ! name of the cookie
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // * 10 years
        httpOnly: true, // * cannot access the cookie from browswer,
        secure: __prod__, // * cookie only works in https
        sameSite: "lax",
      },
      secret: "<hU<gLJ%v?-hVrZ",
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(`Server running on http://localhost:4000`);
  });
};

main().catch((err) => {
  console.log(err);
});
