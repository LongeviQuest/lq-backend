import * as mongoDB from 'mongodb';

import { configuration } from '../configuration';
import { MongoDbWriter } from './MongoDbWriter';
import {
  EditHumanCommandArgs,
  PropertyToEdit,
} from '../commands/EditHumanCommand';

export class EditHumanWriter extends MongoDbWriter<
  EditHumanCommandArgs,
  string
> {
  protected getCollection(): string {
    return configuration.database.table;
  }

  public async executeWrite(
    collection: mongoDB.Document,
    human: EditHumanCommandArgs | undefined
  ): Promise<string> {
    if (!human?.propertiesToUpdate) {
      return '';
    }
    const objectForUpdate = getUpdatableObject(human?.propertiesToUpdate);
    return await collection.updateOne(
      { _id: new mongoDB.ObjectId(human?.id) },
      { $set: objectForUpdate }
    );
  }
}

const getUpdatableObject = (properties: PropertyToEdit[]): Object => {
  const result = {};
  properties.forEach(element => {
    const obj: { [key: string]: any } = {};
    obj[element.name] =
      element.type !== 'date'
        ? element.value ?? ''
        : element.value
        ? new Date(element.value)
        : undefined;
    Object.assign(result, obj);
  });
  return result;
};
