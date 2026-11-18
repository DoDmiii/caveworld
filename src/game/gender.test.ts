import { describe, it, expect } from 'vitest';
import { sexOf } from './gender';
describe('sexOf', () => {
  it('women', () => { expect(sexOf('ura')).toBe('f'); expect(sexOf('nordic-w2')).toBe('f'); expect(sexOf('ally-3')).toBe('f'); });
  it('men', () => { expect(sexOf('bruk')).toBe('m'); expect(sexOf('dragon-m1')).toBe('m'); });
});
