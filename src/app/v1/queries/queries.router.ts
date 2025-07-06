import { GetSupercentenariansQuery } from './../../../queries/GetSupercentenariansQuery';
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

function exportData(req: Request, res: Response, result: object[]) {
  if (req.query.csv === '1') {
    const parser = new Parser({});
    const csv = parser.parse(result);
    res.attachment('data.csv').send(csv);
  } else {
    res.json({
      count: result.length,
      content: result,
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
    const result: [] = await transformOutput(cursor);
    return exportData(req, res, result);
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/top-sc', async (req: Request, res: Response) => {
  try {
    const { human: content } = collections;
    const cursor = await getTopSc(content);
    const result: [] = await transformOutput(cursor);
    return exportData(req, res, result);
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/all-living', async (req: Request, res: Response) => {
  try {
    const input = req.query;
    const { human: content } = collections;
    const cursor = await getAllLiving(content, input);
    const result: [] = await transformOutput(cursor);
    return exportData(req, res, result);
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

    return exportData(req, res, newContent);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
    const result: [] = await transformOutput(cursor);
    return exportData(req, res, result);
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/women-top-sc', async (req: Request, res: Response) => {
  try {
    const { human: content } = collections;
    const cursor = await getTopHumansByGenderSc(content, 'Female');
    const result: [] = await transformOutput(cursor);
    return exportData(req, res, result);
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/men-top-sc', async (req: Request, res: Response) => {
  try {
    const { human: content } = collections;
    const cursor = await getTopHumansByGenderSc(content, 'Male');
    const result: [] = await transformOutput(cursor);
    return exportData(req, res, result);
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
    const result: [] = await transformOutput(cursor);
    return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
    const result: [] = await transformOutput(cursor);
    return exportData(req, res, result);
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/rankings/:slug', async (req: Request, res: Response) => {
  try {
    let rankings: RanksInfo = {
      country: '',
      gender: '',
      world: '',
      countryName: '',
      genderName: '',
    };
    const slug = req.params.slug;
    const { human: content } = collections;
    const getSC = new GetHumanBySlugQuery(slug);
    const getAllSC = new GetSupercentenariansQuery(req.query, true);

    const sc = await getSC.execute();
    if (!sc) {
      res.status(404).send('Could not fetch Supercentenarian by slug');
      return;
    }

    const personalInfo = sc[0].acf.personal_information;

    if (sc[0].ageInYears && sc[0].ageInYears < 110) {
      res.status(204).send({});
      return;
    }

    const allSC = await getAllSC.execute();
    if (!allSC) {
      res.status(404).send('Could not fetch world Supercentenarians');
      return;
    }

    const genderCursor = await getSupercentenariansByGender(
      content,
      req.query,
      personalInfo.sex.name,
      true
    );
    const countryCursor = await getLivingSupercentenariansByCountry(
      content,
      req.query,
      personalInfo.nationality.slug
    );

    const scByGender = (await transformOutput(genderCursor)) as Human[];
    if (!scByGender) {
      res.status(404).send('Could not fetch Supercentenarian by gender');
      return;
    }

    const scByCountry = (await transformOutput(countryCursor)) as Human[];
    if (!scByCountry) {
      res.status(404).send('Could not fetch Supercentenarian by country');
      return;
    }

    const worldIndex = allSC.findIndex(sc => sc.slug === slug) + 1;
    const genderIndex = scByGender.findIndex(human => human.slug === slug) + 1;
    const countryIndex =
      scByCountry.findIndex(human => human.slug === slug) + 1;

    rankings = {
      ...rankings,
      countryName: personalInfo.nationality.name,
      genderName: personalInfo.sex.name,
      country: countryIndex,
      gender: genderIndex,
      world: worldIndex,
    };

    if (!personalInfo.is_dead) {
      const getAllLivingSC = new GetSupercentenariansQuery(
        req.query,
        true,
        true
      );

      const genderLivingCursor = await getSupercentenariansByGender(
        content,
        req.query,
        personalInfo.sex.name,
        true,
        true
      );

      const countryLivingCursor = await getLivingSupercentenariansByCountry(
        content,
        req.query,
        personalInfo.nationality.slug,
        true
      );

      const allLivingSC = await getAllLivingSC.execute();
      if (!allLivingSC) {
        res.status(404).send('Could not fetch living world Supercentenarians');
        return;
      }
      const scLivingByGender = (await transformOutput(
        genderLivingCursor
      )) as Human[];
      if (!scLivingByGender) {
        res
          .status(404)
          .send('Could not fetch living Supercentenarian by gender');
        return;
      }

      const scLivingByCountry = (await transformOutput(
        countryLivingCursor
      )) as Human[];
      if (!scLivingByCountry) {
        res
          .status(404)
          .send('Could not fetch living Supercentenarian by country');
        return;
      }

      const livingWorldIndex =
        allLivingSC.findIndex(sc => sc.slug === slug) + 1;
      const livingGenderIndex =
        scLivingByGender.findIndex(human => human.slug === slug) + 1;
      const livingCountryIndex =
        scLivingByCountry.findIndex(human => human.slug === slug) + 1;

      rankings = {
        ...rankings,
        countryLiving: livingCountryIndex,
        genderLiving: livingGenderIndex,
        worldLiving: livingWorldIndex,
      };
    }

    if (worldIndex === 0 || genderIndex === 0 || countryIndex === 0) {
      res.status(204).send({});
      return;
    }

    res.send(rankings);
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/supercentenarians/women', async (req: Request, res: Response) => {
  try {
    const input = req.query;
    const { human: content } = collections;
    const cursor = await getSupercentenariansByGender(content, input, 'Female');
    const result: [] = await transformOutput(cursor);
    return exportData(req, res, result);
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/supercentenarians', async (req: Request, res: Response) => {
  try {
    const command = new GetSupercentenariansQuery(req.query);
    const result = await command.execute();
    return exportData(req, res, result ?? []);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
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
      const result: [] = await transformOutput(cursor);
      return exportData(req, res, result);
    } catch (error) {
      res.json({ error: `${error}` });
    }
  }
);

export const queries = router;
