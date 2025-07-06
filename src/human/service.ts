import * as mongoDB from 'mongodb';
import { configuration } from '../configuration';

export const collections: { human?: mongoDB.Document } = {};

export const connectToDatabase = async () => {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    configuration.database.connectionString
  );

  await client.connect();

  const db: mongoDB.Db = client.db(configuration.database.name);

  const content: mongoDB.Document = db.collection(configuration.database.table);

  collections.human = content;

  return collections.human;
};

export const transformOutput = async (cursor: any) => {
  return (await cursor?.toArray())?.map((x: any) => {
    return { ...x };
  });
};
