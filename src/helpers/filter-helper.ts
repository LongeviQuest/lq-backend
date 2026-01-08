import QueryString from 'qs';

export interface ComplexFilters {
  age?: number;
  aliveAt?: string;
  dateOfBirth?: DateFilterConfiguration;
  dateOfDeath?: DateFilterConfiguration;
  validation_date?: DateFilterConfiguration;
}

export interface DateFilterConfiguration {
  dateType: DateType;
  dateFilterOption?: DateFilterOption;
  initialDateValue?: string;
  finalDateValue?: string;
}

enum DateType {
  Birth = 'birth',
  Death = 'death',
  ValidationDate = 'validation_date',
}

enum DateFilterOption {
  On = 'on',
  Before = 'before',
  After = 'after',
  Between = 'between',
  BeforeOrEqual = 'beforeOrEqual',
}

const getIsValidatedMatchValue = (value: any): Object[] => {
  return [{ 'acf.sc_validated': value === 'validated' ? true : false }];
};

const getIsAliveMatchValue = (value: any): Object[] => {
  return [
    {
      'acf.personal_information.is_dead': value === 'living' ? false : true,
    },
  ];
};

const getGenderMatchValue = (value: any): Object[] => {
  return [{ 'acf.personal_information.sex.name': { $regex: value } }];
};

const getNameMatchValue = (value: any): Object[] => {
  const names = value.split(' ');
  const nameQueries = names.map((_name: any) => {
    const finalName = _name.trim();
    return {
      $or: [
        {
          'acf.personal_information.name': { $regex: finalName, $options: 'i' },
        },
        {
          'acf.personal_information.lastname': {
            $regex: finalName,
            $options: 'i',
          },
        },
      ],
    };
  });

  return nameQueries;
};

const getCountryOfDeathMatchValue = (value: any): Object[] => {
  return [
    {
      $or: [
        {
          'acf.personal_information.death_place.country.name': {
            $regex: value,
          },
        },
        {
          'acf.personal_information.residence.country.name': {
            $regex: value,
          },
        },
      ],
    },
  ];
};

const getCountryOfBirthMatchValue = (value: any): Object[] => {
  return [
    { 'acf.personal_information.birth_place.country.name': { $regex: value } },
  ];
};

const getPrefectureMatchValue = (value: any): Object[] => {
  return [
    { 'acf.personal_information.prefecture': { $regex: value, $options: 'i' } },
  ];
};

const getStateMatchValue = (value: any): Object[] => {
  return [
    { 'acf.personal_information.state': { $regex: value, $options: 'i' } },
  ];
};

const getAgeMatchValue = (value: any): Object[] => {
  return [{ roundedAgeInYears: { $gt: value } }];
};

const getAliveAtMatchValue = (value: any): Object[] => {
  const date = new Date(value);
  return [
    {
      'acf.personal_information.birth': { $lte: date },
    },
    {
      $or: [
        { 'acf.personal_information.date_of_death': { $gte: date } },
        {
          $and: [
            { 'acf.personal_information.is_dead': false },
            { currentDate: { $gte: date } },
          ],
        },
      ],
    },
  ];
};

const getDateMatchValue = (value: DateFilterConfiguration): Object[] => {
  if (!value?.dateFilterOption) {
    return [];
  }
  return dateActionsRegistry.get(value.dateFilterOption)?.(value) ?? [];
};

const getOnDateMatchValue = (value: DateFilterConfiguration): Object[] => {
  if (!value.initialDateValue) {
    return [{}];
  }
  const date = new Date(value.initialDateValue);
  switch (value.dateType) {
    case DateType.Birth:
      return [
        {
          'acf.personal_information.birth': { $eq: date },
        },
      ];
    case DateType.Death:
      return [
        {
          'acf.personal_information.date_of_death': { $eq: date },
        },
      ];
    case DateType.ValidationDate:
      return [
        {
          'acf.validation_information': { $exists: true },
          'acf.validation_information.validation_date': { $eq: new Date(date) },
        },
      ];
  }
};

const getAfterDateMatchValue = (value: DateFilterConfiguration): Object[] => {
  if (!value.initialDateValue) {
    return [{}];
  }
  const date = new Date(value.initialDateValue);
  switch (value.dateType) {
    case DateType.Birth:
      return [
        {
          'acf.personal_information.birth': { $gt: date },
        },
      ];
    case DateType.Death:
      return [
        {
          'acf.personal_information.date_of_death': { $gt: date },
        },
      ];
    case DateType.ValidationDate:
      return [
        {
          'acf.validation_information': { $exists: true },
          'acf.validation_information.validation_date': { $gt: new Date(date) },
        },
      ];
  }
};

const getBeforeOrEqualDateMatchValue = (
  value: DateFilterConfiguration
): Object[] => {
  if (!value.finalDateValue) {
    return [{}];
  }
  const date = new Date(value.finalDateValue);
  switch (value.dateType) {
    case DateType.Birth:
      return [
        {
          'acf.personal_information.birth': { $lte: date },
        },
      ];
    case DateType.Death:
      return [
        {
          'acf.personal_information.date_of_death': { $lte: date },
        },
      ];
    case DateType.ValidationDate:
      return [
        {
          'acf.validation_information.validation_date': { $lte: date },
        },
      ];
  }
};

const getBeforeDateMatchValue = (value: DateFilterConfiguration): Object[] => {
  if (!value.initialDateValue) {
    return [{}];
  }
  const date = new Date(value.initialDateValue);
  switch (value.dateType) {
    case DateType.Birth:
      return [
        {
          'acf.personal_information.birth': { $lt: date },
        },
      ];
    case DateType.Death:
      return [
        {
          'acf.personal_information.date_of_death': { $lt: date },
        },
      ];
    case DateType.ValidationDate:
      return [
        {
          'acf.validation_information': { $exists: true },
          'acf.validation_information.validation_date': { $lt: new Date(date) },
        },
      ];
  }
};

const getBetweenDateMatchValue = (value: DateFilterConfiguration): Object[] => {
  if (!value.initialDateValue || !value.finalDateValue) {
    return [{}];
  }
  const initialDate = new Date(value.initialDateValue);
  const finalDate = new Date(value.finalDateValue);
  switch (value.dateType) {
    case DateType.Birth:
      return [
        {
          'acf.personal_information.birth': {
            $gte: initialDate,
            $lte: finalDate,
          },
        },
      ];
    case DateType.Death:
      return [
        {
          'acf.personal_information.date_of_death': {
            $gte: initialDate,
            $lte: finalDate,
          },
        },
      ];
    case DateType.ValidationDate:
      return [
        {
          'acf.validation_information': { $exists: true },
          'acf.validation_information.validation_date': {
            $gte: initialDate,
            $lte: finalDate,
          },
        },
      ];
  }
};

const filterRegistry = new Map<string, (value: any) => Object[]>([
  ['validation', (value: any) => getIsValidatedMatchValue(value)],
  ['living', (value: any) => getIsAliveMatchValue(value)],
  ['countryOfDeath', (value: any) => getCountryOfDeathMatchValue(value)],
  ['countryOfBirth', (value: any) => getCountryOfBirthMatchValue(value)],
  ['gender', (value: any) => getGenderMatchValue(value)],
  ['name', (value: any) => getNameMatchValue(value)],
  ['prefecture', (value: any) => getPrefectureMatchValue(value)],
  ['state', (value: any) => getStateMatchValue(value)],
]);

const complexFilterRegistry = new Map<string, (value: any) => Object[]>([
  ['age', (value: any) => getAgeMatchValue(value)],
  ['aliveAt', (value: any) => getAliveAtMatchValue(value)],
  [
    'validation_date',
    (value: DateFilterConfiguration) => getDateMatchValue(value),
  ],
  ['dateOfBirth', (value: DateFilterConfiguration) => getDateMatchValue(value)],
  ['dateOfDeath', (value: DateFilterConfiguration) => getDateMatchValue(value)],
]);

const dateActionsRegistry = new Map<
  DateFilterOption,
  (value: DateFilterConfiguration) => Object[]
>([
  [
    DateFilterOption.On,
    (value: DateFilterConfiguration) => getOnDateMatchValue(value),
  ],
  [
    DateFilterOption.After,
    (value: DateFilterConfiguration) => getAfterDateMatchValue(value),
  ],
  [
    DateFilterOption.Before,
    (value: DateFilterConfiguration) => getBeforeDateMatchValue(value),
  ],
  [
    DateFilterOption.Between,
    (value: DateFilterConfiguration) => getBetweenDateMatchValue(value),
  ],
  [
    DateFilterOption.BeforeOrEqual,
    (value: DateFilterConfiguration) => getBeforeOrEqualDateMatchValue(value),
  ],
]);

const getComplexFilterInput = (input: QueryString.ParsedQs): ComplexFilters => {
  return {
    age: input['age'] ? +input['age'] : undefined,
    aliveAt: input['aliveAt']?.toString(),
    dateOfBirth: {
      dateType: DateType.Birth,
      dateFilterOption: input['dateOfBirth']?.toString() as DateFilterOption,
      initialDateValue: input['initialBirthDateValue']?.toString(),
      finalDateValue: input['finalBirthDateValue']?.toString(),
    },
    dateOfDeath: {
      dateType: DateType.Death,
      dateFilterOption: input['dateOfDeath']?.toString() as DateFilterOption,
      initialDateValue: input['initialDeathDateValue']?.toString(),
      finalDateValue: input['finalDeathDateValue']?.toString(),
    },
    validation_date: {
      dateType: DateType.ValidationDate,
      dateFilterOption: input['validationDate']?.toString() as DateFilterOption,
      initialDateValue: input['initialValidationDateValue']?.toString(),
      finalDateValue: input['finalValidationDateValue']?.toString(),
    },
  };
};

const buildSimpleFilters = (input: QueryString.ParsedQs) => {
  const result: Object[] = [];
  for (const key of Object.keys(input)) {
    if (
      input[key] &&
      !['Any', 'any', undefined, null].includes(input[key] as any)
    ) {
      const filterObject = filterRegistry.get(key)?.(input[key]);
      if (filterObject) {
        filterObject.map(filter => result.push(filter));
      }
    }
  }
  return result;
};

const getSimpleFilters = (
  defaultFilter: Object,
  input: QueryString.ParsedQs
): Object[] => {
  const filters = buildSimpleFilters(input);
  return filters && filters.length > 0 ? filters : [defaultFilter];
};

export const getAllFilters = (
  defaultFilter: Object,
  input: QueryString.ParsedQs
) => {
  const simpleFilters = getSimpleFilters(defaultFilter, input);
  const complexFilterInput = getComplexFilterInput(input);
  const result = simpleFilters;
  if (complexFilterInput) {
    for (const key of Object.keys(complexFilterInput)) {
      const element = (complexFilterInput as any)[key];
      if (element && !['Any', 'any', undefined, null].includes(element)) {
        const filterObject = complexFilterRegistry.get(key)?.(element);
        if (filterObject) {
          filterObject.map(filter => result.push(filter));
        }
      }
    }
  }
  return result;
};

export const getSort = (
  input: QueryString.ParsedQs,
  order?: 'date-of-birth' | 'date-of-death' | 'validation-date',
  orderDirection?: 'ascending' | 'descending'
): Object => {
  const orderBy = input['orderBy']?.toString() ?? order;
  const direction = input['direction']?.toString() ?? orderDirection;
  switch (orderBy) {
    case 'date-of-birth':
      return {
        $sort: {
          'acf.personal_information.birth': direction === 'ascending' ? 1 : -1,
          ageInMilliseconds: direction === 'ascending' ? 1 : -1,
        },
      };
    case 'date-of-death':
      return {
        $sort: {
          'acf.personal_information.date_of_death':
            direction === 'ascending' ? 1 : -1,
          ageInMilliseconds: direction === 'ascending' ? 1 : -1,
        },
      };
    case 'validation-date':
      return {
        $sort: {
          'acf.validation_information.validation_date':
            direction === 'ascending' ? 1 : -1,
        },
      };
    default: {
      return {
        $sort: {
          ageInMilliseconds: direction === 'ascending' ? 1 : -1,
        },
      };
    }
  }
};

export const getAgeInYears = () => {
  return [
    {
      $addFields: {
        currentDate: new Date(),
        ageInMilliseconds: {
          $dateDiff: {
            startDate: { $toDate: '$acf.personal_information.birth' },
            endDate: {
              $ifNull: [
                { $toDate: '$acf.personal_information.date_of_death' },
                '$$NOW',
              ],
            },
            unit: 'millisecond',
          },
        },
        roundedAgeInYears: {
          $round: {
            $divide: [
              {
                $subtract: [
                  {
                    $ifNull: [
                      { $toDate: '$acf.personal_information.date_of_death' },
                      '$$NOW',
                    ],
                  },
                  '$acf.personal_information.birth',
                ],
              },
              1000 * 60 * 60 * 24 * 365,
            ],
          },
        },
      },
    },
  ];
};

export const excludedFieldsForProfile = {
  $project: {
    yoast_head: 0,
    _links: 0,
    template: 0,
    yoast_head_json: 0,
    attribution: 0,
  },
};

export const excludedFields = {
  $project: {
    yoast_head: 0,
    _links: 0,
    content: 0,
    template: 0,
    'acf.biography': 0,
    'acf.recognition': 0,
    'acf.gallery_section': 0,
    yoast_head_json: 0,
    'biography.0.paragraph': 0,
    'biography.1.paragraph': 0,
    'recognition.0.paragraph': 0,
    'recognition.1.paragraph': 0,
    attribution: 0,
  },
};
