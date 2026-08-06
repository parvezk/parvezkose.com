import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./test-loader.mjs', pathToFileURL('./'));
