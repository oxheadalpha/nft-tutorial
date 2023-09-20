#!/usr/bin/env node

import { newKeys } from './new-keys';

const main = async () => {
  console.log(await newKeys());
};

main();
