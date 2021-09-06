/* eslint-disable no-console */
import cbor from 'cbor';

function encode(value) {
    console.log('Input value:');
    console.log(value);
    const encoded = cbor.encode(value);
    console.log('Hex encoded:');
    console.log(encoded.toString('hex'));
    console.log('First byte of encoding, as binary:');
    console.log(encoded[0].toString(2));
}

if (process.argv.length < 3) {
    console.log('Please provide input to encode!');
} else {
    const input = process.argv[2];
    encode(input);
}
