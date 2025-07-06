import { configuration } from '../configuration';
import { Human } from '../models/Human';
import { ValidationResult } from '../models/ValidationResult';
import { GetHumanReader } from '../readers/GetHumanReader';
import { Query } from './Query';

export class GetHumanQuery extends Query<Human[] | undefined> {
  private reader: GetHumanReader;
  constructor(private id: string) {
    super({ needValidation: true });
    this.reader = new GetHumanReader(
      configuration.database.connectionString,
      configuration.database.name
    );
  }
  protected validate(): ValidationResult | undefined {
    let validationResult: ValidationResult = { failCauses: [] };
    if (!this.id) {
      validationResult.failCauses?.push('the id is required');
    }
    return validationResult;
  }
  protected async executeQuery(): Promise<Human[] | undefined> {
    return await this.reader.read(this.id);
  }
}
