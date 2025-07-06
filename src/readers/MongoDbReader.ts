import * as mongoDB from 'mongodb';
import { Reader } from './Reader';
import { MongoDbHelper } from '../helpers/MongoDbHelper';

export abstract class MongoDbReader<Argument, Result> extends Reader<
  Argument,
  Result
> {
  private mongoDbHelper: MongoDbHelper;

  public constructor(connectionString: string, databaseName: string) {
    super();
    this.mongoDbHelper = new MongoDbHelper(connectionString, databaseName);
  }

  public async transformOutput(cursor: any) {
    return (await cursor?.toArray())?.map((element: any) => {
      return { ...element };
    });
  }

  public async read(argument?: Argument): Promise<Result | undefined> {
    const collectionName = this.getCollection();
    const collection = await this.mongoDbHelper.connectToDatabase(
      collectionName
    );
    const cursor = await this.executeRead(collection, argument);
    const result: Result = await this.transformOutput(cursor);
    this.mongoDbHelper.disconnectFromDatabase();
    return result;
  }
  protected abstract getCollection(): string;
  public abstract executeRead(
    collection: mongoDB.Document,
    argument?: Argument
  ): Promise<Result>;
}
