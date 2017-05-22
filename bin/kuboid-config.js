#!/usr/bin/env node

const program = require('commander');
const colors = require('colors');
const config = require('../lib/config');
const logger = require('../lib/logger');
const questions = require('../lib/questions');

program
  .command('list')
  .arguments('<project> <namespace>')
  .action((project, namespace) => {
    config.list(project, namespace).forEach(v => {
      logger.info(colors.green(`${v.name}`));
    });
  });

program
  .command('get')
  .arguments('<project> <namespace> <name>')
  .action((project, namespace, name) => {
    logger.info(colors.green(`${name}: ${config.get(project, namespace, name)}`));
  });

program
  .command('get-all')
  .arguments('<project> <namespace>')
  .action((project, namespace) => {
    config.getAll(project, namespace).forEach(v => {
      logger.info(colors.green(`${v.name}: ${v.value}`));
    });
  });

program
  .command('set')
  .arguments('<project> <namespace> <name> <value>')
  .action((project, namespace, name, value) => {
    const replacedName = name.replace('.', '/');
    let currentValue = '';
    try {
      currentValue = config.get(project, namespace, replacedName);
    } catch (err) {
    }
    if (value === currentValue) {
      logger.info(`${colors.green('skipping')}: value is already set to ${colors.green(value)}`);
      process.exit(0);
    }

    if (currentValue) {
      questions.confirmVariableOverwrite({
        name: replacedName,
        previous: currentValue,
        new: value,
      })
      .then(answer => {
        if (answer.confirm === true) {
          logger.info(`  ${config.set(project, namespace, replacedName, value)}`);
        }
      });
    } else {
      logger.info(`  ${config.set(project, namespace, replacedName, value)}`);
    }
  });

program.parse(process.argv);
