import { Document } from 'mongodb';
import {
  getAllFilters,
  getSort,
  getAgeInYears,
  excludedFields,
} from '../helpers/filter-helper';
import QueryString from 'qs';

export const getTopSc = async (content: Document | undefined) => {
  return await content
    ?.aggregate([
      {
        $match: {
          'acf.personal_information.is_dead': false,
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
              1000 * 60 * 60 * 24 * 365,
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
      excludedFields,
    ])
    .limit(10);
};

export const getAllLiving = async (
  content: Document | undefined,
  input: QueryString.ParsedQs
) => {
  return await content?.aggregate([
    ...getAgeInYears(),
    {
      $match: {
        status: 'publish',
        $and: getAllFilters(
          { 'acf.personal_information.is_dead': false },
          input
        ),
      },
    },
    getSort(input),
    excludedFields,
  ]);
};

export const getTopHumansByGenderSc = async (
  content: Document | undefined,
  gender: string
) => {
  return await content
    ?.aggregate([
      {
        $match: {
          'acf.personal_information.is_dead': false,
          'acf.personal_information.sex.name': gender,
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
              1000 * 60 * 60 * 24 * 365,
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
      excludedFields,
    ])
    .limit(30);
};

export const getSupercentenariansByGender = async (
  content: Document | undefined,
  input: QueryString.ParsedQs,
  gender: string,
  showValidated?: boolean,
  showLiving?: boolean
) => {
  const defaultValidatedFilter = {
    'acf.sc_validated': true,
    'acf.personal_information.sex.name': gender,
  };
  const defaultFilter = {
    'acf.personal_information.sex.name': gender,
  };
  const defaultLivingFilter = {
    'acf.sc_validated': true,
    'acf.personal_information.is_dead': false,
    'acf.personal_information.sex.name': gender,
  };

  const getDefaultFilters = () => {
    if (showLiving) return defaultLivingFilter;
    if (showValidated) return defaultValidatedFilter;
    return defaultFilter;
  };

  return await content?.aggregate([
    ...getAgeInYears(),
    {
      $match: {
        status: 'publish',
        $and: getAllFilters(getDefaultFilters(), input),
      },
    },
    getSort(input),
    excludedFields,
  ]);
};

export const getSupercentenariansByEmigration = async (
  content: Document | undefined,
  input: QueryString.ParsedQs,
  isEmigrant: boolean
) => {
  let matchExpression = null;
  if (isEmigrant) {
    matchExpression = {
      $expr: {
        $ne: [
          '$acf.personal_information.nationality.name',
          '$acf.personal_information.birth_place.country.name',
        ],
      },
    };
  } else {
    matchExpression = {
      $expr: {
        $eq: [
          '$acf.personal_information.nationality.name',
          '$acf.personal_information.birth_place.country.name',
        ],
      },
    };
  }
  return await content?.aggregate([
    ...getAgeInYears(),
    {
      $match: {
        status: 'publish',
        $and: [...getAllFilters(matchExpression, input), matchExpression],
      },
    },
    getSort(input),
    excludedFields,
  ]);
};

export const getByValidationDate = async (
  content: Document | undefined,
  date: string
) => {
  return await content
    ?.aggregate([
      {
        $match: {
          'acf.sc_validated': true,
          'acf.validation_information.validation_date': date,
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
              1000 * 60 * 60 * 24 * 365,
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
      excludedFields,
    ])
    .limit(30);
};

export const getByWordPressId = async (
  content: Document | undefined,
  wordPressId: number
) => {
  return await content
    ?.aggregate([
      {
        $match: {
          id: wordPressId,
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
              1000 * 60 * 60 * 24 * 365,
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
      excludedFields,
    ])
    .limit(30);
};

export const getTopLivingHumansByNationality = async (
  content: Document | undefined,
  nationality: string
) => {
  return await content
    ?.aggregate([
      {
        $match: {
          'acf.personal_information.is_dead': false,
          'acf.personal_information.nationality.slug': nationality,
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
              1000 * 60 * 60 * 24 * 365,
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
      excludedFields,
    ])
    .limit(30);
};

export const getTopHumansByNationality = async (
  content: Document | undefined,
  nationality: string
) => {
  return await content
    ?.aggregate([
      {
        $match: {
          'acf.personal_information.nationality.name': nationality,
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
              1000 * 60 * 60 * 24 * 365,
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
      excludedFields,
    ])
    .limit(30);
};

export const getLivingSupercentenariansByCountry = async (
  content: Document | undefined,
  input: QueryString.ParsedQs,
  nationality: string,
  showLiving?: boolean
) => {
  const defaultFilter = {
    'acf.sc_validated': true,
    'acf.personal_information.nationality.slug': nationality,
  };

  const defaultLivingFilters = {
    'acf.sc_validated': true,
    'acf.personal_information.is_dead': false,
    'acf.personal_information.nationality.slug': nationality,
  };

  const getDefaultFilters = () => {
    if (showLiving) return defaultLivingFilters;
    return defaultFilter;
  };

  return await content?.aggregate([
    ...getAgeInYears(),
    {
      $match: {
        status: 'publish',
        $and: [
          ...getAllFilters(getDefaultFilters(), input),
          getDefaultFilters(),
        ],
      },
    },
    getSort(input),
    excludedFields,
  ]);
};

export const getAllHumansByBirthdayMonth = async (
  content: Document | undefined,
  month: number
) => {
  return await content?.aggregate([
    ...getAgeInYears(),
    {
      $addFields: {
        birth_month: { $month: '$acf.personal_information.birth' },
      },
    },
    {
      $addFields: {
        birthDate: { $toDate: '$acf.personal_information.birth' },
        currentDate: new Date(),
      },
    },
    {
      $match: {
        status: 'publish',
        birth_month: month,
        'acf.sc_validated': true,
        'acf.personal_information.is_dead': false,
      },
    },
    {
      $sort: {
        ageInMilliseconds: -1,
      },
    },
    excludedFields,
  ]);
};

export const getRecentSuperCentenarianValidations = async (
  content: Document | undefined,
  input: QueryString.ParsedQs,
  range: number
) => {
  let fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - range);
  const defaultFilter = {
    'acf.sc_validated': true,
    roundedAgeInYears: { $gte: 110 },
    'acf.validation_information.validation_date': {
      $gte: fromDate,
      $lt: new Date(),
    },
  };
  return await content?.aggregate([
    ...getAgeInYears(),
    {
      $match: {
        status: 'publish',
        $and: getAllFilters(defaultFilter, input),
      },
    },
    getSort(input, 'validation-date'),
    excludedFields,
  ]);
};

export const getRecentCentenarianValidations = async (
  content: Document | undefined,
  range: number
) => {
  let fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - range);
  return await content?.aggregate([
    ...getAgeInYears(),
    {
      $match: {
        status: 'publish',
        'acf.sc_validated': true,
        ageInYears: { $lte: 109 },
        'acf.validation_information.validation_date': {
          $gte: fromDate,
          $lt: new Date(),
        },
      },
    },
    {
      $sort: {
        ageInMilliseconds: -1,
      },
    },
    excludedFields,
  ]);
};

export const getSupercentenariansDiedRecently = async (
  content: Document | undefined,
  input: QueryString.ParsedQs,
  range: number
) => {
  let fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - range);
  const defaultFilter = {
    'acf.sc_validated': true,
    'acf.personal_information.date_of_death': {
      $gte: fromDate,
      $lt: new Date(),
    },
  };
  return await content?.aggregate([
    ...getAgeInYears(),
    {
      $match: {
        status: 'publish',
        $and: [...getAllFilters(defaultFilter, input), defaultFilter],
      },
    },
    {
      $sort: {
        'acf.personal_information.date_of_death': -1,
        total_milliseconds: -1,
      },
    },
    excludedFields,
  ]);
};

export const performSearchOnSC = async (
  content: Document | undefined,
  matchExpression: object
) => {
  return await content?.aggregate([
    ...getAgeInYears(),
    excludedFields,
    {
      $match: matchExpression,
      status: 'publish',
    },
    {
      $sort: {
        ageInMilliseconds: -1,
      },
    },
  ]);
};

export const getSupercentenariansTitleHolderByCountry = async (
  content: Document | undefined,
  range: number
) => {
  let fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - range);
  return await content?.aggregate([
    ...getAgeInYears(),
    {
      $match: {
        'acf.sc_validated': true,
        status: 'publish',
      },
    },
    {
      $group: {
        _id: '$acf.personal_information.residence.country.name',
        human: {
          $top: {
            output: ['$$ROOT', '$roundedAgeInYears'],
            sortBy: { ageInMilliseconds: -1 },
          },
        },
      },
    },
    { $sort: { _id: -1 } },
    excludedFields,
  ]);
};

export const getSupercentenariansCountByCountry = async (
  content: Document | undefined
) => {
  return await content?.aggregate([
    ...getAgeInYears(),
    excludedFields,
    {
      $match: {
        'acf.sc_validated': true,
        status: 'publish',
      },
    },
    {
      $group: {
        _id: '$acf.personal_information.nationality.name',
        count: { $count: {} },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

export const getSupercentenariansCountByPrefecture = async (
  content: Document | undefined,
  nationality: string
) => {
  return await content?.aggregate([
    ...getAgeInYears(),
    excludedFields,
    {
      $match: {
        'acf.personal_information.nationality.slug': nationality,
        'acf.sc_validated': true,
        status: 'publish',
      },
    },
    {
      $group: {
        _id: {
          $ifNull: [
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: {
                      $arrayElemAt: [
                        {
                          $split: [
                            '$acf.personal_information.death_place.city',
                            ', ',
                          ],
                        },
                        1,
                      ],
                    },
                    regex: /Prefecture/,
                  },
                },
                then: {
                  $trim: {
                    input: {
                      $replaceOne: {
                        input: {
                          $arrayElemAt: [
                            {
                              $split: [
                                '$acf.personal_information.death_place.city',
                                ', ',
                              ],
                            },
                            1,
                          ],
                        },
                        find: ' Prefecture',
                        replacement: '',
                      },
                    },
                  },
                },
                else: 'Unknown',
              },
            },
            {
              $cond: {
                if: {
                  $regexMatch: {
                    input: {
                      $arrayElemAt: [
                        {
                          $split: [
                            '$acf.personal_information.death_place.city',
                            ', ',
                          ],
                        },
                        1,
                      ],
                    },
                    regex: /Prefecture/,
                  },
                },
                then: {
                  $trim: {
                    input: {
                      $replaceOne: {
                        input: {
                          $arrayElemAt: [
                            {
                              $split: [
                                '$acf.personal_information.residence.city',
                                ', ',
                              ],
                            },
                            1,
                          ],
                        },
                        find: ' Prefecture',
                        replacement: '',
                      },
                    },
                  },
                },
                else: 'Unknown',
              },
            },
          ],
        },
        count: { $count: {} },
      },
    },
    { $sort: { _id: -1 } },
  ]);
  // Repeated due to unknown character:  Hyōgo
};
