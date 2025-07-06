import { Document } from 'mongodb';
import { MongoDbReader } from './MongoDbReader';
import { configuration } from '../configuration';
import { Human } from '../models/Human';
import QueryString from 'qs';
import {
  excludedFields,
  getAgeInYears,
  getAllFilters,
  getSort,
} from '../helpers/filter-helper';

interface GetSupercentenariansReaderArgument {
  filters: QueryString.ParsedQs;
  showValidated?: boolean;
  showLiving?: boolean;
}
export class GetSupercentenariansReader extends MongoDbReader<
  GetSupercentenariansReaderArgument,
  Human[]
> {
  protected getCollection(): string {
    return configuration.database.table;
  }
  public async executeRead(
    collection: Document,
    args: GetSupercentenariansReaderArgument
  ): Promise<any[]> {
    const defaultFilter = {};
    const defaultValidatedFilter = {
      'acf.sc_validated': true,
    };

    const defaultLivingFilter = {
      'acf.sc_validated': true,
      'acf.personal_information.is_dead': false,
    };

    const getDefaultFilters = () => {
      if (args.showLiving) return defaultLivingFilter;
      if (args.showValidated) return defaultValidatedFilter;
      return defaultFilter;
    };

    const cursor = await collection?.aggregate([
      ...getAgeInYears(),
      {
        $match: {
          status: 'publish',
          $and: [
            ...getAllFilters(getDefaultFilters(), args.filters),
            defaultFilter,
          ],
        },
      },
      getSort(args.filters),
      excludedFields,
    ]);
    return cursor;
  }
}
