import { forEach } from 'lodash';

export interface SearchQuery {
  $and: Object[];
}

interface MultipleOptionsSection {
  $or: Object[];
}

interface MdbDateRange {
  $gte: Date | null;
  $lte: Date | null;
}
interface ValueRange {
  start: string;
  end: string;
}

class QueryBuilder {
  private query: SearchQuery = { $and: [] };
  private nameSection?: MultipleOptionsSection | null = { $or: [] };
  private birthPlacesSection: MultipleOptionsSection | null = { $or: [] };
  private deathPlacesSection: MultipleOptionsSection | null = { $or: [] };
  private statusSection: MultipleOptionsSection | null = { $or: [] };
  private genderSection: MultipleOptionsSection | null = { $or: [] };
  private age: MultipleOptionsSection | null = { $or: [] };
  private currentResidencePlaceSection: MultipleOptionsSection | null = {
    $or: [],
  };
  private isLivingSection: {
    'acf.personal_information.is_dead': {} | null;
  } | null = { 'acf.personal_information.is_dead': {} };
  private birthDateRangeSection: {
    'acf.personal_information.birth': MdbDateRange | null;
  } | null = {
    'acf.personal_information.birth': { $gte: null, $lte: null },
  };

  private deathDateRangeSection: {
    'acf.personal_information.date_of_death'?: MdbDateRange;
  } | null = {
    'acf.personal_information.date_of_death': { $gte: null, $lte: null },
  };

  clear() {
    this.query = { $and: [] };
    this.nameSection = null;
    this.birthDateRangeSection = null;
    this.deathPlacesSection = null;
    this.deathDateRangeSection = null;
    this.birthPlacesSection = null;
    this.statusSection = null;
    this.genderSection = null;
    this.isLivingSection = null;
    this.currentResidencePlaceSection = null;
    this.age = null;
    return this;
  }

  withAge(ageRanges: ValueRange[]) {
    if (ageRanges) {
      this.age = { $or: [] };
      forEach(ageRanges, x => {
        this.age?.$or.push({
          $and: [
            {
              $expr: {
                $gte: [
                  {
                    $floor: {
                      $divide: [
                        {
                          $subtract: [
                            {
                              $toDate:
                                '$acf.personal_information.date_of_death',
                            },
                            {
                              $toDate: '$acf.personal_information.birth',
                            },
                          ],
                        },
                        31557600000, // Number of milliseconds in a year (1000 * 60 * 60 * 24 * 365.25)
                      ],
                    },
                  },
                  x.start,
                ],
              },
            },
            {
              $expr: {
                $lte: [
                  {
                    $floor: {
                      $divide: [
                        {
                          $subtract: [
                            {
                              $toDate:
                                '$acf.personal_information.date_of_death',
                            },
                            {
                              $toDate: '$acf.personal_information.birth',
                            },
                          ],
                        },
                        31557600000, // Number of milliseconds in a year (1000 * 60 * 60 * 24 * 365.25)
                      ],
                    },
                  },
                  x.end,
                ],
              },
            },
          ],
        });
      });
    }
    return this;
  }

  withBirthDateRange(birthDateRange?: ValueRange) {
    if (birthDateRange) {
      this.birthDateRangeSection = {
        'acf.personal_information.birth': {
          $lte: new Date(birthDateRange.end),
          $gte: new Date(birthDateRange.start),
        },
      };
    }
    return this;
  }

  withDeathDateRange(deathDateRange?: ValueRange) {
    if (deathDateRange) {
      this.deathDateRangeSection = {
        'acf.personal_information.date_of_death': {
          $lte: new Date(deathDateRange.end),
          $gte: new Date(deathDateRange.start),
        },
      };
    }
    return this;
  }

  public withName(name?: string) {
    if (name) {
      this.nameSection = { $or: [] };
      const names = name.split(' ');
      forEach(names, x => {
        const finalName = x.trim();
        this.nameSection?.$or.push({
          'acf.personal_information.name': {
            $regex: finalName,
            $options: 'i',
          },
        });
        this.nameSection?.$or.push({
          'acf.personal_information.lastname': {
            $regex: finalName,
            $options: 'i',
          },
        });
      });
    }
    return this;
  }

  withBirthPlace(birthPlaces?: string[]) {
    if (birthPlaces && birthPlaces.length > 0) {
      this.birthPlacesSection = { $or: [] };
      birthPlaces.forEach(place => {
        this.birthPlacesSection?.$or.push({
          'acf.personal_information.birth_place.country.name': {
            $regex: place,
          },
        });
      });
    }
    return this;
  }

  withDeathPlace(deathPlaces: string[] | undefined) {
    if (deathPlaces && deathPlaces.length > 0) {
      this.deathPlacesSection = { $or: [] };
      deathPlaces.forEach(place => {
        this.deathPlacesSection?.$or.push({
          'acf.personal_information.death_place.country.name': {
            $regex: place,
          },
        });
      });
    }
    return this;
  }

  withStatus(status?: string[]) {
    if (status && status.length > 0) {
      this.statusSection = { $or: [] };
      status.forEach(element => {
        this.statusSection?.$or.push({
          sc_validated: { $regex: element },
        });
      });
    }
    return this;
  }

  withGender(gender: string[] | undefined) {
    if (gender && gender.length > 0) {
      this.genderSection = { $or: [] };
      gender.forEach(element => {
        this.genderSection?.$or.push({
          'acf.personal_information.sex.name': { $regex: element },
        });
      });
    }
    return this;
  }

  withCurrentResidencePlace(residenceCountry: string[] | undefined) {
    if (residenceCountry && residenceCountry.length > 0) {
      this.currentResidencePlaceSection = { $or: [] };
      residenceCountry.forEach(element => {
        this.currentResidencePlaceSection?.$or.push({
          'acf.personal_information.residence.country.name': {
            $regex: element,
          },
        });
      });
    }
    return this;
  }

  isLiving(isLiving: boolean) {
    this.isLivingSection = {
      'acf.personal_information.is_dead': !isLiving,
    };
    return this;
  }

  buildFieldsForAgeWork = () => {
    return {
      $addFields: {
        ageInMilliseconds: {
          $dateDiff: {
            startDate: '$acf.personal_information.birth',
            endDate: {
              $ifNull: ['$acf.personal_information.date_of_death', '$$NOW'],
            },
            unit: 'millisecond',
          },
        },
        ageInYears: {
          $dateDiff: {
            startDate: '$acf.personal_information.birth',
            endDate: {
              $ifNull: ['$acf.personal_information.date_of_death', '$$NOW'],
            },
            unit: 'year',
          },
        },
      },
    };
  };

  public build() {
    if (this.nameSection) this.query.$and.push(this.nameSection);
    if (this.birthDateRangeSection)
      this.query.$and.push(this.birthDateRangeSection);
    if (this.deathDateRangeSection)
      this.query.$and.push(this.deathDateRangeSection);
    if (this.birthPlacesSection) this.query.$and.push(this.birthPlacesSection);
    if (this.deathPlacesSection) this.query.$and.push(this.deathPlacesSection);
    if (this.statusSection) this.query.$and.push(this.statusSection);
    if (this.genderSection) this.query.$and.push(this.genderSection);
    if (this.isLivingSection) this.query.$and.push(this.isLivingSection);
    if (this.currentResidencePlaceSection)
      this.query.$and.push(this.currentResidencePlaceSection);
    if (this.age) this.query.$and.push(this.age);
    return this.query;
  }
}

class QueryBuilderAggregations {
  private query: SearchQuery = { $and: [] };
  private nameSection?: MultipleOptionsSection | null = { $or: [] };
  private birthPlacesSection: MultipleOptionsSection | null = { $or: [] };
  private deathPlacesSection: MultipleOptionsSection | null = { $or: [] };
  private statusSection: MultipleOptionsSection | null = { $or: [] };
  private genderSection: MultipleOptionsSection | null = { $or: [] };
  private age: MultipleOptionsSection | null = { $or: [] };
  private currentResidencePlaceSection: MultipleOptionsSection | null = {
    $or: [],
  };
  private isLivingSection: {
    'acf.personal_information.is_dead': {} | null;
  } | null = { 'acf.personal_information.is_dead': {} };
  private birthDateRangeSection: {
    'acf.personal_information.birth': MdbDateRange | null;
  } | null = {
    'acf.personal_information.birth': { $gte: null, $lte: null },
  };

  private deathDateRangeSection: {
    'acf.personal_information.date_of_death'?: MdbDateRange;
  } | null = {
    'acf.personal_information.date_of_death': { $gte: null, $lte: null },
  };

  clear() {
    this.query = { $and: [] };
    this.nameSection = null;
    this.birthDateRangeSection = null;
    this.deathPlacesSection = null;
    this.deathDateRangeSection = null;
    this.birthPlacesSection = null;
    this.statusSection = null;
    this.genderSection = null;
    this.isLivingSection = null;
    this.currentResidencePlaceSection = null;
    this.age = null;
    return this;
  }

  withAge(ageRanges: ValueRange[]) {
    if (ageRanges) {
      this.age = { $or: [] };
      forEach(ageRanges, x => {
        this.age?.$or.push({
          $and: [
            { ageInYears: { $gte: x.start } },
            { ageInYears: { $lte: x.end } },
          ],
        });
      });
    }
    return this;
  }

  withBirthDateRange(birthDateRange?: ValueRange) {
    if (birthDateRange) {
      this.birthDateRangeSection = {
        'acf.personal_information.birth': {
          $lte: new Date(birthDateRange.end),
          $gte: new Date(birthDateRange.start),
        },
      };
    }
    return this;
  }

  withDeathDateRange(deathDateRange?: ValueRange) {
    if (deathDateRange) {
      this.deathDateRangeSection = {
        'acf.personal_information.date_of_death': {
          $lte: new Date(deathDateRange.end),
          $gte: new Date(deathDateRange.start),
        },
      };
    }
    return this;
  }

  public withName(name?: string) {
    if (name) {
      this.nameSection = { $or: [] };
      const names = name.split(' ');
      forEach(names, x => {
        const finalName = x.trim();
        this.nameSection?.$or.push({
          'acf.personal_information.name': { $regex: finalName, $options: 'i' },
        });
        this.nameSection?.$or.push({
          'acf.personal_information.lastname': {
            $regex: finalName,
            $options: 'i',
          },
        });
      });
    }
    return this;
  }

  withBirthPlace(birthPlaces?: string[]) {
    if (birthPlaces && birthPlaces.length > 0) {
      this.birthPlacesSection = { $or: [] };
      birthPlaces.forEach(place => {
        this.birthPlacesSection?.$or.push({
          'acf.personal_information.birth_place.country.name': {
            $regex: place,
          },
        });
      });
    }
    return this;
  }

  withDeathPlace(deathPlaces: string[] | undefined) {
    if (deathPlaces && deathPlaces.length > 0) {
      this.deathPlacesSection = { $or: [] };
      deathPlaces.forEach(place => {
        this.deathPlacesSection?.$or.push({
          'acf.personal_information.death_place.country.name': {
            $regex: place,
          },
        });
      });
    }
    return this;
  }

  withStatus(status?: string[]) {
    if (status && status.length > 0) {
      this.statusSection = { $or: [] };
      status.forEach(element => {
        this.statusSection?.$or.push({
          sc_validated: { $regex: element },
        });
      });
    }
    return this;
  }

  withGender(gender: string[] | undefined) {
    if (gender && gender.length > 0) {
      this.genderSection = { $or: [] };
      gender.forEach(element => {
        this.genderSection?.$or.push({
          'acf.personal_information.sex.name': { $regex: element },
        });
      });
    }
    return this;
  }

  withCurrentResidencePlace(residenceCountry: string[] | undefined) {
    if (residenceCountry && residenceCountry.length > 0) {
      this.currentResidencePlaceSection = { $or: [] };
      residenceCountry.forEach(element => {
        this.currentResidencePlaceSection?.$or.push({
          'acf.personal_information.residence.country.name': {
            $regex: element,
          },
        });
      });
    }
    return this;
  }

  isLiving(isLiving: boolean) {
    this.isLivingSection = {
      'acf.personal_information.is_dead': !isLiving,
    };
    return this;
  }

  buildFieldsForAgeWork = () => {
    return {
      $addFields: {
        ageInMilliseconds: {
          $dateDiff: {
            startDate: '$acf.personal_information.birth',
            endDate: {
              $ifNull: ['$acf.personal_information.date_of_death', '$$NOW'],
            },
            unit: 'millisecond',
          },
        },
        ageInYears: {
          $dateDiff: {
            startDate: '$acf.personal_information.birth',
            endDate: {
              $ifNull: ['$acf.personal_information.date_of_death', '$$NOW'],
            },
            unit: 'year',
          },
        },
      },
    };
  };

  public build(): object {
    if (this.nameSection) this.query.$and.push(this.nameSection);
    if (this.birthDateRangeSection)
      this.query.$and.push(this.birthDateRangeSection);
    if (this.deathDateRangeSection)
      this.query.$and.push(this.deathDateRangeSection);
    if (this.birthPlacesSection) this.query.$and.push(this.birthPlacesSection);
    if (this.deathPlacesSection) this.query.$and.push(this.deathPlacesSection);
    if (this.statusSection) this.query.$and.push(this.statusSection);
    if (this.genderSection) this.query.$and.push(this.genderSection);
    if (this.isLivingSection) this.query.$and.push(this.isLivingSection);
    if (this.currentResidencePlaceSection)
      this.query.$and.push(this.currentResidencePlaceSection);
    if (this.age) this.query.$and.push(this.age);
    return this.query;
  }
}

export const queryBuilderAggregations = new QueryBuilderAggregations();

export const queryBuilder = new QueryBuilder();
