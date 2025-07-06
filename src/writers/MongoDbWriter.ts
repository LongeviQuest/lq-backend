import * as mongoDB from "mongodb";
import { Writer } from "./Writer";
import { MongoDbHelper } from "../helpers/MongoDbHelper";
export abstract class MongoDbWriter<Argument, Result> extends Writer<
  Argument,
  Result
> {
  protected mongoDbHelper: MongoDbHelper;

  public constructor(connectionString: string, databaseName: string) {
    super();
    this.mongoDbHelper = new MongoDbHelper(connectionString, databaseName);
  }

  public async write(argument?: Argument): Promise<Result | undefined> {
    const collectionName = this.getCollection();
    const collection = await this.mongoDbHelper.connectToDatabase(
      collectionName
    );
    const result = await this.executeWrite(collection, argument);
    this.mongoDbHelper.disconnectFromDatabase();
    return result;
  }

  protected abstract getCollection(): string;

  protected abstract executeWrite(
    collection: mongoDB.Document,
    argument?: Argument
  ): Promise<Result>;
}
