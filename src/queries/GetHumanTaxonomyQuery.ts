import { configuration } from '../configuration';
import { ValidationResult } from '../models/ValidationResult';
import { GetHumanSlugReader } from '../readers/GetHumanBySlugReader ';
import { GetHumanTaxonomyReader } from '../readers/GetHumanTaxonomyReader';
import { Query } from './Query';

export class GetHumanTaxonomyQuery extends Query<any | undefined> {
  private humanSlugReader: GetHumanSlugReader;
  private taxonomySlugReader: GetHumanTaxonomyReader;
  constructor(private slug: string) {
    super({ needValidation: true });
    this.humanSlugReader = new GetHumanSlugReader(
      configuration.database.connectionString,
      configuration.database.name
    );
    this.taxonomySlugReader = new GetHumanTaxonomyReader();
  }

  protected validate(): ValidationResult | undefined {
    let validationResult: ValidationResult = { failCauses: [] };
    if (!this.slug) {
      validationResult.failCauses?.push('the slug is required');
    }
    return validationResult;
  }
  protected async executeQuery(): Promise<any | undefined> {
    const human = await this.humanSlugReader.read(this.slug);

    if (!human) {
      return [];
    }

    const firstHuman = human[0];

    const taxonomy = await this.taxonomySlugReader.read({
      slug: firstHuman.title.rendered,
      sex: firstHuman.acf.personal_information.sex.slug,
    });

    return { ...firstHuman, taxonomy };
  }
}
