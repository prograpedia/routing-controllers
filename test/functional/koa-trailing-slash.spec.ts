import koa, {default as KoaApplication} from 'koa';
import { Server as HttpServer } from 'http';
import HttpStatusCodes from 'http-status-codes';
import { Controller } from '../../src/decorator/Controller';
import { Get } from '../../src/decorator/Get';
import { Post } from '../../src/decorator/Post';
import { UploadedFile } from '../../src/decorator/UploadedFile';
import { createKoaServer, getMetadataArgsStorage } from '../../src/index';
import { axios } from '../utilities/axios';
import DoneCallback = jest.DoneCallback;
import FormData from 'form-data';
import fs from 'node:fs';
import { Buffer } from "node:buffer";
import path from 'path';

describe(``, () => {
  let koaServer: HttpServer;

  describe('koa trailing slashes', () => {
    beforeEach((done: DoneCallback) => {
      getMetadataArgsStorage().reset();

      @Controller('/posts')
      class PostController {
        @Get('/')
        getAll(): string {
          return '<html><body>All posts</body></html>';
        }

        @Post('/')
        create(@UploadedFile('file') file: any): any {
          return file;
        }
      }

      createKoaServer().then((app: KoaApplication) => {
        koaServer = app.listen(3001, done)
      });
    });

    afterEach((done: DoneCallback) => {
      koaServer.close(done);
    });

    it('get should respond to request without a traling slash', async () => {
      expect.assertions(3);
      const response = await axios.get('/posts');
      expect(response.status).toEqual(HttpStatusCodes.OK);
      expect(response.headers['content-type']).toEqual('text/html; charset=utf-8');
      expect(response.data).toEqual('<html><body>All posts</body></html>');
    });

    it('get should respond to request with a traling slash', async () => {
      expect.assertions(3);
      const response = await axios.get('/posts/');
      expect(response.status).toEqual(HttpStatusCodes.OK);
      expect(response.headers['content-type']).toEqual('text/html; charset=utf-8');
      expect(response.data).toEqual('<html><body>All posts</body></html>');
    });

    it('post should accept a file', async() => {
      expect.assertions(3);
      const formData = new FormData();
      formData.append('file', fs.createReadStream(__filename));
      const response = await axios.post('/posts', formData, {headers: {'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`}});
      expect(response.status).toEqual(HttpStatusCodes.OK);
      expect(response.headers['content-type']).toEqual('application/json; charset=utf-8');
      expect(response.data.originalname).toEqual(path.basename(__filename));
    })
  });
});
