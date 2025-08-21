import { Document } from 'mongodb';
import { Human } from '../models/Human';
import { MongoDbReader } from './MongoDbReader';
import { configuration } from '../configuration';
import { excludedFieldsForProfile } from '../helpers/filter-helper';

export class GetHumanSlugReader extends MongoDbReader<string, Human[]> {
  protected getCollection(): string {
    return configuration.database.table;
  }
  public async executeRead(
    collection: Document,
    slug: string
  ): Promise<Human[]> {
    return await collection
      ?.aggregate([
        {
          $match: {
            slug: slug,
            status: 'publish',
          },
        },
        {
          $addFields: {
            birthDate: {
              $toDate: '$acf.personal_information.birth',
            },
            currentDate: new Date(),
          },
        },
        {
          $addFields: {
            ageInMilliseconds: {
              $subtract: [
                {
                  $ifNull: [
                    '$acf.personal_information.date_of_death',
                    '$currentDate',
                  ],
                },
                '$birthDate',
              ],
            },
            ageInYears: {
              $divide: [
                {
                  $subtract: [
                    {
                      $ifNull: [
                        '$acf.personal_information.date_of_death',
                        '$currentDate',
                      ],
                    },
                    '$birthDate',
                  ],
                },
                1000 * 60 * 60 * 24 * 365.2425,
              ],
            },
            roundedAgeInYears: {
              $round: {
                $divide: [
                  {
                    $subtract: [
                      {
                        $ifNull: [
                          '$acf.personal_information.date_of_death',
                          '$currentDate',
                        ],
                      },
                      '$birthDate',
                    ],
                  },
                  1000 * 60 * 60 * 24 * 365,
                ],
              },
            },
          },
        },
        {
          $sort: {
            ageInYears: -1,
          },
        },
        excludedFieldsForProfile,
      ])
      .limit(1);
  }
}
