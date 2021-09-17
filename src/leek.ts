import { got } from './helpers/got';
import { Account } from './types/Account';

// eslint-disable-next-line @typescript-eslint/naming-convention
const FormData = require('form-data');


function makeForm(json: any) {
    const form = new FormData();
    for (let key in json) {
        form.append(key, json[key]);
    }
    return form;
}

export async function farmerLoginToken(login: string, password: string) {
    return await got.post(`farmer/login-token`, {
        body: makeForm({login, password})
    }).json<Account>();
}
