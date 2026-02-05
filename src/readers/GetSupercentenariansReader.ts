import { Document } from 'mongodb';
import { configuration } from '../configuration';
import { Human } from '../models/Human';
import QueryString from 'qs';
import {
  excludedFields,
  getAgeInYears,
  getAllFilters,
  getSort,
} from '../helpers/filter-helper';
import { MongoDbHelper } from '../helpers/MongoDbHelper';

type GetSupercentenariansReaderArgument = {
  filters: QueryString.ParsedQs;
  showValidated?: boolean;
  showLiving?: boolean;
};

type PaginatedResult = {
  total: number;
  data: Human[];
};

export class GetSupercentenariansReader {
  private mongoDbHelper: MongoDbHelper;

  constructor(connectionString: string, databaseName: string) {
    this.mongoDbHelper = new MongoDbHelper(connectionString, databaseName);
  }

  public async read(args?: GetSupercentenariansReaderArgument): Promise<PaginatedResult> {
    const collection = await this.mongoDbHelper.connectToDatabase(
      configuration.database.table
    );
    const result = await this.executeRead(collection, args);
    await this.mongoDbHelper.disconnectFromDatabase();
    return result;
  }

  private async executeRead(
    collection: Document,
    args?: GetSupercentenariansReaderArgument
  ): Promise<PaginatedResult> {
    if (!args) {
      args = { filters: {} };
    }

    const defaultFilter = {};
    const defaultValidatedFilter = {
      'acf.sc_validated': true,
    };

    const defaultLivingFilter = {
      'acf.sc_validated': true,
      'acf.personal_information.is_dead': false,
    };

    const getDefaultFilters = () => {
      if (args!.showLiving) return defaultLivingFilter;
      if (args!.showValidated) return defaultValidatedFilter;
      return defaultFilter;
    };

    const page = parseInt(args.filters.page as string) || 1;
    const limitParam = Array.isArray(args.filters.limit) ? args.filters.limit[0] : args.filters.limit;
    const limit = limitParam === 'all' ? -1 : (parseInt(limitParam as string) || 100);

    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = [25, 50, 100, -1].includes(limit) ? limit : 100;
    const validatedSkip = (validatedPage - 1) * (validatedLimit === -1 ? 0 : validatedLimit);

    const baseQuery = [
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
    ];
    if (validatedLimit === -1) {
      const data = await collection?.aggregate([
        ...baseQuery,
        getSort(args.filters),
        excludedFields,
      ]).toArray();

      return {
        total: data.length,
        data: data,
      };
    }

    const dataPipeline = [
      getSort(args.filters),
      { $skip: validatedSkip },
      { $limit: validatedLimit },
      excludedFields,
    ];

    const result = await collection?.aggregate([
      ...baseQuery,
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: dataPipeline,
        },
      },
    ]).toArray();

    const total = result[0]?.metadata[0]?.total || 0;
    const data = result[0]?.data || [];

    return {
      total: total,
      data: data,
    };
  }
}
