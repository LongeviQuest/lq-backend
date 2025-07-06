import * as mongoDB from "mongodb";

export class MongoDbHelper {
  private client: mongoDB.MongoClient;
  constructor(connectionString: string, private databaseName: string) {
    this.client = new mongoDB.MongoClient(connectionString);
  }
  public connectToDatabase = async (collectionName: string) => {
    await this.client.connect();
    const db: mongoDB.Db = this.client.db(this.databaseName);
    const content: mongoDB.Document = db.collection(collectionName);
    return content;
  };

  public getGridFSBucket = async () => {
    await this.client.connect();
    const db: mongoDB.Db = this.client.db(this.databaseName);
    const content = new mongoDB.GridFSBucket(db);
    return content;
  };

  public disconnectFromDatabase = async () => {
    return await this.client.close();
  };
}
