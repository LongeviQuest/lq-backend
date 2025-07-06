import express, { Request, Response } from 'express';
import * as mongoDB from 'mongodb';
import {
  collections,
  connectToDatabase,
  transformOutput,
} from '../../../human/service';
import { EditHumanCommand } from '../../../commands/EditHumanCommand';
import { GetHumanQuery } from '../../../queries/GetHumanQuery';
import { GetHumanBySlugQuery } from '../../../queries/GetHumanBySlugQuery';
import { GetHumanTaxonomyQuery } from '../../../queries/GetHumanTaxonomyQuery';
import { Human } from '../../../models/Human';
import { getAgeObject } from '../../../helpers/date-helper';

const router = express.Router();
connectToDatabase();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const query = new GetHumanQuery(req.params.id);
    const result = await query.execute();
    res.json({
      content: result ? result[0] : [],
    });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const query = new GetHumanBySlugQuery(req.params.slug);
    const result = await query.execute();
    res.json({
      content: result ? result[0] : [],
    });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.get('/taxonomy/:slug', async (req: Request, res: Response) => {
  try {
    const query = new GetHumanTaxonomyQuery(req.params.slug);
    const result = await query.execute();
    res.json({
      content: result,
    });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const propertiesToUpdate = req.body;
    const command = new EditHumanCommand({
      id: req.params.id,
      propertiesToUpdate: propertiesToUpdate,
    });
    const result = await command.execute();
    res.json({
      content: result,
    });
  } catch (error) {
    res.json({ error: `${error}` });
  }
});

router.post('/supercentenarians/age', async (req: Request, res: Response) => {
  try {
    const { human: content } = collections;

    if (!content) {
      throw new Error('There was an error obtaining the Supercentenarians');
    }

    const cursor = await content.find({ status: 'publish' });
    const humanResult: [] = await transformOutput(cursor);

    const updatePromises = humanResult.map(async (human: Human) => {
      const id = human._id.toString();

      const ageObject = getAgeObject(human);

      return await content.updateOne(
        { _id: new mongoDB.ObjectId(id) },
        { $set: ageObject }
      );
    });

    await Promise.all(updatePromises);
    res.json({ message: 'Update Completed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error });
  }
});

router.post(
  '/supercentenarians/age/:id',
  async (req: Request, res: Response) => {
    try {
      const { human: content } = collections;
      const id = parseInt(req.params.id);

      if (!content) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'There was an error obtaining the Supercentenarians',
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Missing "id" parameter',
        });
        return;
      }

      const human: Human = await content.findOne({ id: id });

      if (!human) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'We could not find a Supercentenarian with that ID.',
        });
        return;
      }

      const ageObject = getAgeObject(human);

      await content.updateOne({ id: id }, { $set: ageObject });

      res.json({ message: 'Update Completed' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error', error: error });
    }
  }
);

export const humans = router;
