import { GetSupercentenariansQuery, PaginatedResult } from './../../../queries/GetSupercentenariansQuery';
import express, { Request, Response } from 'express';
import { Parser } from '@json2csv/plainjs';
import {
  collections,
  connectToDatabase,
  transformOutput,
} from '../../../human/service';
import {
  getTopHumansByGenderSc,
  getTopSc,
  performSearchOnSC,
  getAllHumansByBirthdayMonth,
  getRecentSuperCentenarianValidations,
  getRecentCentenarianValidations,
  getSupercentenariansDiedRecently,
  getSupercentenariansTitleHolderByCountry,
  getByWordPressId,
  getTopLivingHumansByNationality,
  getSupercentenariansCountByCountry,
  getAllLiving,
  getByValidationDate,
  getTopHumansByNationality,
  getLivingSupercentenariansByCountry,
  getSupercentenariansByGender,
  getSupercentenariansByEmigration,
  getSupercentenariansCountByPrefecture,
  getSupercentenariansByPrefecture,
} from '../../../tools/aggregations';
import {
  queryBuilder,
  queryBuilderAggregations,
} from '../../../tools/query-builder';
import { GetHumanBySlugQuery } from '../../../queries/GetHumanBySlugQuery';
import { Human } from '../../../models/Human';
import { RanksInfo } from '../../../models/RanksInfo';

const router = express.Router();
connectToDatabase();

function exportData(req: Request, res: Response, result: PaginatedResult) {
  if (req.query.csv === '1') {
    const parser = new Parser({});
    const csv = parser.parse(result.data || []);
    res.attachment('data.csv').send(csv);
  } else {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const validatedLimit = [10, 25, 50, 100].includes(limit) ? limit : 25;

    res.json({
      count: result.total,
      content: result.data,
      page: page,
      limit: validatedLimit,
      totalPages: Math.ceil(result.total / validatedLimit),
    });
  }
}

router.post('/custom', async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const query = input.query;
    const { human: content } = collections;
    const cursor = await content?.find(query);
    const result: [] = await transformOutput(cursor);
    res.json({
      count: result.length,
      content: result,
    });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.post('/search', async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const query = queryBuilder
      .clear()
      .withName(input.query.name)
      .withBirthDateRange(input.query.birthDateRange)
      .withDeathDateRange(input.query.deathDateRange)
      .withBirthPlace(input.query.birthPlaces)
      .withDeathPlace(input.query.deathPlaces)
      .withStatus(input.query.status)
      .withGender(input.query.gender)
      .isLiving(input.query.isLiving)
      .withCurrentResidencePlace(input.query.residenceCountries)
      .withAge(input.query.ageRanges)
      .build();

    const { human: content } = collections;
    const cursor = await content?.find(query);
    const data: Human[] = await transformOutput(cursor);
    return exportData(req, res, { total: data.length, data });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/top-sc', async (req: Request, res: Response) => {
  try {
    const { human: content } = collections;
    const cursor = await getTopSc(content);
    const data: Human[] = await transformOutput(cursor);
    return exportData(req, res, { total: data.length, data });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/all-living', async (req: Request, res: Response) => {
  try {
    const input = req.query;
    const { human: content } = collections;
    const cursor = await getAllLiving(content, input);
    const data: Human[] = await transformOutput(cursor);
    return exportData(req, res, { total: data.length, data });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/sc-by-wp-id/:wpid', async (req: Request, res: Response) => {
  try {
    const wordPressId = parseInt(req.params.wpid);
    const { human: content } = collections;
    const cursor = await getByWordPressId(content, wordPressId);
    const result: any = await transformOutput(cursor);

    const newContent = result[0] as any;
    if (newContent.id === 1072) {
      newContent['taxonomy_MilitaryService'] = 'World War I';
      newContent['taxonomy_Marriage'] = 'N/A';
      newContent['taxonomy_Issue'] = 'N/A';
      newContent['taxonomy_Family'] = 'N/A';
      newContent['taxonomy_SelfExpression'] = 'N/A';
      newContent['taxonomy_HabitVices'] = 'Cigarretes, Beer';
      newContent['taxonomy_CauseOfDeath'] = 'N/A';
    } else {
      newContent['taxonomy_MilitaryService'] = 'N/A';
      newContent['taxonomy_Marriage'] = 'N/A';
      newContent['taxonomy_Issue'] = 'N/A';
      newContent['taxonomy_Family'] = 'N/A';
      newContent['taxonomy_SelfExpression'] = 'N/A';
      newContent['taxonomy_HabitVices'] = 'N/A';
      newContent['taxonomy_CauseOfDeath'] = 'N/A';
    }

    return exportData(req, res, { total: 1, data: [newContent] });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get(
  '/top-living-sc-by-country/:nationality',
  async (req: Request, res: Response) => {
    try {
      let nationality = req.params.nationality.toLowerCase().replace(/\s+/g, '-');
      if (nationality === 'united-states') {
        nationality = 'usa';
      };
      const { human: content } = collections;
      const cursor = await getTopLivingHumansByNationality(
        content,
        nationality
      );
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get(
  '/sc-by-country/:nationality',
  async (req: Request, res: Response) => {
    try {
      let nationality = req.params.nationality.toLowerCase().replace(/\s+/g, '-');
      if (nationality === 'united-states') {
        nationality = 'usa';
      };
      const { human: content } = collections;
      const cursor = await getTopHumansByNationality(content, nationality);
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get(
  '/supercentenarians/country/:nationality',
  async (req: Request, res: Response) => {
    try {
      const input = req.query;
      let nationality = req.params.nationality.toLowerCase().replace(/\s+/g, '-');
      if (nationality === 'united-states') {
        nationality = 'usa';
      };
      const { human: content } = collections;
      const cursor = await getLivingSupercentenariansByCountry(
        content,
        input,
        nationality
      );
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get('/sc-by-date/:date', async (req: Request, res: Response) => {
  try {
    const date = req.params.validation_information_validation_date;
    const { human: content } = collections;
    const cursor = await getByValidationDate(content, date);
    const data: Human[] = await transformOutput(cursor);
    return exportData(req, res, { total: data.length, data });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/women-top-sc', async (req: Request, res: Response) => {
  try {
    const { human: content } = collections;
    const cursor = await getTopHumansByGenderSc(content, 'Female');
    const data: Human[] = await transformOutput(cursor);
    return exportData(req, res, { total: data.length, data });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/men-top-sc', async (req: Request, res: Response) => {
  try {
    const { human: content } = collections;
    const cursor = await getTopHumansByGenderSc(content, 'Male');
    const data: Human[] = await transformOutput(cursor);
    return exportData(req, res, { total: data.length, data });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/birthday/:month', async (req: Request, res: Response) => {
  try {
    const numberMonth = parseInt(req.params.month);
    if (isNaN(numberMonth) || numberMonth < 1 || numberMonth > 12) {
      res.json({ error: `Bad input` });
      return;
    }
    const { human: content } = collections;
    const cursor = await getAllHumansByBirthdayMonth(content, numberMonth);
    const data: Human[] = await transformOutput(cursor);
    return exportData(req, res, { total: data.length, data });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get(
  '/supercentenarians/recent_validations',
  async (req: Request, res: Response) => {
    try {
      const input = req.query;
      const { human: content } = collections;
      const cursor = await getRecentSuperCentenarianValidations(
        content,
        input,
        30
      );
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get(
  '/centenarians/recent_validations',
  async (req: Request, res: Response) => {
    try {
      const { human: content } = collections;
      const cursor = await getRecentCentenarianValidations(content, 30);
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get(
  '/supercentenarians/died_recently',
  async (req: Request, res: Response) => {
    try {
      const input = req.query;
      const { human: content } = collections;
      const cursor = await getSupercentenariansDiedRecently(content, input, 60);
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.post(
  '/supercentenarians/search',
  async (req: Request, res: Response) => {
    try {
      const { human: content } = collections;
      const input = req.body;
      const query = queryBuilderAggregations
        .clear()
        .withName(input.query.name)
        .withBirthDateRange(input.query.birthDateRange)
        .withDeathDateRange(input.query.deathDateRange)
        .withBirthPlace(input.query.birthPlaces)
        .withDeathPlace(input.query.deathPlaces)
        .withStatus(input.query.status)
        .withGender(input.query.gender)
        .isLiving(input.query.isLiving)
        .withCurrentResidencePlace(input.query.residenceCountries)
        .withAge(input.query.ageRanges)
        .build();
      const cursor = await performSearchOnSC(content, query);
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get(
  '/supercentenarians/top_by_country',
  async (req: Request, res: Response) => {
    try {
      const { human: content } = collections;
      const cursor = await getSupercentenariansTitleHolderByCountry(
        content,
        60
      );
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get(
  '/supercentenarians/sc-count-by-country',
  async (req: Request, res: Response) => {
    try {
      const { human: content } = collections;
      const cursor = await getSupercentenariansCountByCountry(content);
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get(
  '/supercentenarians/sc-count-by-prefecture/:nationality',
  async (req: Request, res: Response) => {
    try {
      const { human: content } = collections;
      let nationality = req.params.nationality.toLowerCase().replace(/\s+/g, '-');
      if (nationality === 'united-states') {
        nationality = 'usa';
      };
      const cursor = await getSupercentenariansCountByPrefecture(
        content,
        nationality
      );
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get(
  '/supercentenarians/prefecture/:nationality/:prefecture',
  async (req: Request, res: Response) => {
    try {
      const input = req.query;
      const { human: content } = collections;
      let nationality = req.params.nationality.toLowerCase().replace(/\s+/g, '-');
      if (nationality === 'united-states') {
        nationality = 'usa';
      };
      const prefecture = req.params.prefecture.toLowerCase();
      const cursor = await getSupercentenariansByPrefecture(
        content,
        input,
        nationality,
        prefecture
      );
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get('/supercentenarians/men', async (req: Request, res: Response) => {
  try {
    const input = req.query;
    const { human: content } = collections;
    const cursor = await getSupercentenariansByGender(content, input, 'Male');
    const data: Human[] = await transformOutput(cursor);
    return exportData(req, res, { total: data.length, data });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/rankings/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const { human: content } = collections;

    const getSC = new GetHumanBySlugQuery(slug);
    const sc = await getSC.execute();

    if (!sc || !sc[0]) {
      res.status(404).send('Could not fetch Supercentenarian by slug');
      return;
    }

    const person = sc[0];
    const personalInfo = person.acf.personal_information;

    if (person.ageInYears && person.ageInYears < 110) {
      res.status(204).send({});
      return;
    }
    const targetAge = person.total_milliseconds || person.acf.personal_information.ageInMilliseconds;

    if (!targetAge) {
      res.status(500).send('Could not calculate age for ranking');
      return;
    }

    const countBetterRanks = async (filters: any) => {
      const result = await content?.aggregate([
        {
          $addFields: {
            ageInMilliseconds: {
              $cond: {
                if: { $eq: ['$acf.personal_information.is_dead', false] },
                then: {
                  $subtract: [new Date(), { $toDate: '$acf.personal_information.birth' }],
                },
                else: {
                  $subtract: [
                    { $toDate: '$acf.personal_information.date_of_death' },
                    { $toDate: '$acf.personal_information.birth' },
                  ],
                },
              },
            },
          },
        },
        {
          $match: {
            status: 'publish',
            ageInMilliseconds: { $gte: targetAge },
            slug: { $ne: slug },
            ...filters,
          },
        },
        {
          $count: 'count',
        },
      ]).toArray();

      return result.length > 0 ? result[0].count + 1 : 1;
    };

    const worldRank = await countBetterRanks({
      'acf.sc_validated': true,
    });

    const genderRank = await countBetterRanks({
      'acf.sc_validated': true,
      'acf.personal_information.sex.name': personalInfo.sex.name,
    });

    const countryRank = await countBetterRanks({
      'acf.sc_validated': true,
      'acf.personal_information.nationality.slug': personalInfo.nationality.slug,
    });

    let rankings: RanksInfo = {
      countryName: personalInfo.nationality.name,
      genderName: personalInfo.sex.name,
      country: countryRank,
      gender: genderRank,
      world: worldRank,
      ageInYears: person.time_components?.years,
      ageInDays: person.time_components?.days,
    };

    if (!personalInfo.is_dead) {
      const worldLivingRank = await countBetterRanks({
        'acf.sc_validated': true,
        'acf.personal_information.is_dead': false,
      });

      const genderLivingRank = await countBetterRanks({
        'acf.sc_validated': true,
        'acf.personal_information.is_dead': false,
        'acf.personal_information.sex.name': personalInfo.sex.name,
      });

      const countryLivingRank = await countBetterRanks({
        'acf.sc_validated': true,
        'acf.personal_information.is_dead': false,
        'acf.personal_information.nationality.slug': personalInfo.nationality.slug,
      });

      rankings = {
        ...rankings,
        countryLiving: countryLivingRank,
        genderLiving: genderLivingRank,
        worldLiving: worldLivingRank,
      };
    }

    res.send(rankings);
  } catch (error) {
    console.error('Rankings endpoint error:', error);
    res.status(500).json({ error: `${error}` });
  }
});

router.get('/supercentenarians/women', async (req: Request, res: Response) => {
  try {
    const input = req.query;
    const { human: content } = collections;
    const cursor = await getSupercentenariansByGender(content, input, 'Female');
    const data: Human[] = await transformOutput(cursor);
    return exportData(req, res, { total: data.length, data });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/supercentenarians', async (req: Request, res: Response) => {
  try {
    const command = new GetSupercentenariansQuery(req.query);
    const result = await command.execute();
    if (!result) {
      return res.json({ error: 'No data found' });
    }
    return exportData(req, res, result);
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get(
  '/supercentenarians/emigrants',
  async (req: Request, res: Response) => {
    try {
      const input = req.query;
      const { human: content } = collections;
      const cursor = await getSupercentenariansByEmigration(
        content,
        input,
        true
      );
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

router.get(
  '/supercentenarians/non-emigrants',
  async (req: Request, res: Response) => {
    try {
      const input = req.query;
      const { human: content } = collections;
      const cursor = await getSupercentenariansByEmigration(
        content,
        input,
        false
      );
      const data: Human[] = await transformOutput(cursor);
      return exportData(req, res, { total: data.length, data });
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

export const queries = router;
