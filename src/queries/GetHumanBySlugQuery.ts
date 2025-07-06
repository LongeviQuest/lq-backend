import { configuration } from '../configuration';
import { Human } from '../models/Human';
import { ValidationResult } from '../models/ValidationResult';
import { GetHumanSlugReader } from "../readers/GetHumanBySlugReader ";
import { Query } from './Query';

export class GetHumanBySlugQuery extends Query<Human[] | undefined> {
    private reader: GetHumanSlugReader;
    constructor(private slug: string) {
        super({ needValidation: true });
        this.reader = new GetHumanSlugReader(
            configuration.database.connectionString,
            configuration.database.name
        );
    }
    protected validate(): ValidationResult | undefined {
        let validationResult: ValidationResult = { failCauses: [] };
        if (!this.slug) {
            validationResult.failCauses?.push('the slug is required');
        }
        return validationResult;
    }
    protected async executeQuery(): Promise<Human[] | undefined> {
        return await this.reader.read(this.slug);
    }
}
