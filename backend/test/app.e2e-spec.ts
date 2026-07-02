import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

// Mock explicit pour les modeles lourds qui posent probleme dans Jest (CommonJS vs ESM)
jest.mock('@xenova/transformers', () => {
  return {
    pipeline: jest.fn().mockResolvedValue(jest.fn().mockResolvedValue({ text: 'mocked transcript' })),
    env: { local_model_path: '', allow_remote_models: false },
  };
});

import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
