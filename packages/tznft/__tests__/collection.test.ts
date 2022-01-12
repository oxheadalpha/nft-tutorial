import {TestApi, bootstrap} from './test-bootstrap';

jest.setTimeout(240000);

describe('NFT Collection Tests', () => {
  let api: TestApi;

  beforeAll(async () => {
    const tzApi = await bootstrap();
    api = tzApi;
  });

  test('dummy', () => {
    console.log('HELLO');
  });

});
