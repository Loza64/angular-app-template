import { AbstractService } from './abstract-service';
import { Service } from './service';

describe('AbstractService', () => {
  it('should create an instance', () => {
    expect(new Service({})).toBeTruthy();
  });
});
