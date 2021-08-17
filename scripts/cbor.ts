/* eslint-disable no-console */
import cbor from 'cbor';

const string = process.argv[2];

function encode(s) {
    console.log('----');
    console.log(s);
    const encoded = cbor.encode(s);
    console.log(encoded);
    console.log(encoded.toString('hex'));
    console.log(encoded[0].toString(2));
}

encode(string);
encode(-2);
encode(18446744073709551615);
encode(17446744073709551610);
encode(BigInt('18446744073709551615'));
