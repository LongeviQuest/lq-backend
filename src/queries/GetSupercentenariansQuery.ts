import { Human } from '../models/Human';
import { ValidationResult } from '../models/ValidationResult';
import { GetSupercentenariansReader } from '../readers/GetSupercentenariansReader';
import { Query } from './Query';
import { configuration } from '../configuration';
import QueryString from 'qs';

export class GetSupercentenariansQuery extends Query<Human[]> {
  private reader: GetSupercentenariansReader;
  constructor(
    private filters: QueryString.ParsedQs,
    private showValidated?: boolean,
    private showLiving?: boolean
  ) {
    super({ needValidation: false });

    this.reader = new GetSupercentenariansReader(
      configuration.database.connectionString,
      configuration.database.name
    );
  }
  protected validate(): ValidationResult | undefined {
    return {};
  }
  protected async executeQuery(): Promise<Human[]> {
    return (
      (await this.reader.read({
        filters: this.filters,
        showValidated: this.showValidated,
        showLiving: this.showLiving,
      })) ?? []
    );
  }
}
