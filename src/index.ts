import express, { Express, Request, Response } from 'express';

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

import cors from 'cors';
import { v1Router } from './app/v1/v1-api.router';

const app: Express = express();
const port = 4200;

Sentry.init({
  dsn: 'https://80b27bb8570cbcfdb07e4f9f45cb6de4@o350524.ingest.sentry.io/4506467991224320',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    // new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(express.urlencoded());
app.use(express.json());
app.use(cors());

app.use('/v1', v1Router);

app.use(Sentry.Handlers.errorHandler());

app.use(function onError(err: any, req: any, res: any, next: any) {
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});

app.listen(process.env.PORT || port, () => {
  console.log(`⚡️[server]: Server is running in ${port}.`);
});
