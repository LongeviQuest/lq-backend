import { configuration } from '../configuration';
import { Reader } from './Reader';
import taxonomyData from '../data/supercentenarians.json';
import {
  SupercentenarianTaxonomy,
  TaxonomyReaderArgs,
} from '../models/Taxonomy';

export class GetHumanTaxonomyReader extends Reader<
  TaxonomyReaderArgs,
  SupercentenarianTaxonomy
> {
  public read(
    argument?: TaxonomyReaderArgs | undefined
  ): Promise<SupercentenarianTaxonomy | undefined> {
    if (!argument) {
      return Promise.resolve(undefined);
    }

    if (argument.sex === 'female' || argument.sex === 'women') {
      const scTaxonomy: SupercentenarianTaxonomy | undefined =
        taxonomyData.women.find(
          supercentenarian =>
            supercentenarian.general.name.toLowerCase() ===
            argument.slug.toLowerCase()
        ) ?? undefined;

      return Promise.resolve(scTaxonomy);
    }

    if (argument.sex === 'male' || argument.sex === 'men') {
      const scTaxonomy: SupercentenarianTaxonomy | undefined =
        taxonomyData.men.find(
          supercentenarian =>
            supercentenarian.general.name.toLowerCase() ===
            argument.slug.toLowerCase()
        ) ?? undefined;

      return Promise.resolve(scTaxonomy);
    }

    throw new Error('Method not implemented.');
  }
}
