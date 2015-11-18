'use strict';

import * as util from 'util';

export default function log(message, verbose) {
  if (message && verbose) {
    util.log(util.format('[postcss-cysprites] => %s', message));
  }
}