import { Document, ObjectId } from 'mongodb';
import { Human } from '../models/Human';
import { MongoDbReader } from './MongoDbReader';
import { configuration } from '../configuration';

export class GetHumanReader extends MongoDbReader<string, Human[]> {
  protected getCollection(): string {
    return configuration.database.table;
  }
  public async executeRead(collection: Document, id: string): Promise<Human[]> {
    return await collection?.find({ _id: new ObjectId(id) });
  }
}
