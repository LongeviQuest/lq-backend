export interface TaxonomyReaderArgs {
  slug: string;
  sex: string;
}

export interface SupercentenarianTaxonomy {
  general: {
    rank: string;
    name: string;
    age: {
      years: string;
      days: string;
    };
    continent: string;
  };
  family: {
    parents: string;
    siblings: string;
    children: string;
    survived_children: string;
  };
  marriage: {
    age_at_first_marriage: string;
    length_of_first_marriage: string;
    number_of_marriages: string;
    age_widowed: string;
  };
  military: {
    military_service: string;
    combat: string;
  };
  risky_habits: {
    alcohol_consumption: string;
    smoking: string;
  };
  health_issues: {
    major_illnesses: string;
  };
  activities_of_daily_living: {
    standing: {
      age_100: string;
      age_110: string;
    };
    walking: {
      age_100: string;
      age_110: string;
    };
  };
}
