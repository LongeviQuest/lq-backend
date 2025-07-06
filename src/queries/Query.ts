import { QueryOptions } from '../models/Options';
import { ValidationResult } from '../models/ValidationResult';

export abstract class Query<Result> {
  private queryOptions: QueryOptions | undefined;

  constructor(queryOptions?: QueryOptions) {
    this.queryOptions = queryOptions;
  }

  protected abstract validate(): ValidationResult | undefined;

  public async execute(): Promise<Result | undefined> {
    if (this.queryOptions?.needValidation) {
      const validation = this.validate();
      if (validation?.failCauses && validation?.failCauses?.length > 0) {
        throw new Error(
          `${
            Object(this).constructor.name
          } has failed because the validations didn't pass due the following errors: ${validation.failCauses?.join(
            ' or '
          )}`
        );
      }
    }
    return await this.executeQuery();
  }
  protected abstract executeQuery(): Promise<Result>;
}
