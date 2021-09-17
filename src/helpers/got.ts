import _got from 'got';

export const got = _got.extend({
    prefixUrl: 'https://leekwars.com/api/',
});
