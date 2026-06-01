#!/usr/bin/env node

const assert = require('node:assert/strict');
const path = require('node:path');

const { games } = require(path.join('..', 'data', 'games.json'));

const gameMap = new Map(games.map((game) => [game.id, game]));

function getGame(id) {
  const game = gameMap.get(id);
  assert.ok(game, `Missing game constant: ${id}`);
  assert.equal(typeof game.yaw, 'number', `${id} yaw must be a number`);
  assert.ok(game.yaw > 0, `${id} yaw must be positive`);
  return game;
}

function assertPositiveNumber(value, label) {
  assert.equal(typeof value, 'number', `${label} must be a number`);
  assert.ok(Number.isFinite(value), `${label} must be finite`);
  assert.ok(value > 0, `${label} must be positive`);
}

function edpi(dpi, sensitivity) {
  assertPositiveNumber(dpi, 'dpi');
  assertPositiveNumber(sensitivity, 'sensitivity');
  return dpi * sensitivity;
}

function inchesPer360({ dpi, sensitivity, yaw }) {
  assertPositiveNumber(dpi, 'dpi');
  assertPositiveNumber(sensitivity, 'sensitivity');
  assertPositiveNumber(yaw, 'yaw');
  return 360 / (dpi * sensitivity * yaw);
}

function cmPer360(input) {
  return inchesPer360(input) * 2.54;
}

function convertSensitivity({ from, to, sensitivity, dpi, targetDpi = dpi }) {
  const source = getGame(from);
  const target = getGame(to);
  const inches = inchesPer360({ dpi, sensitivity, yaw: source.yaw });
  return 360 / (targetDpi * target.yaw * inches);
}

function approx(actual, expected, epsilon = 0.000001) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `Expected ${actual} to be within ${epsilon} of ${expected}`
  );
}

function run() {
  approx(edpi(800, 0.4), 320);
  approx(edpi(1600, 0.2), 320);

  approx(
    cmPer360({ dpi: 800, sensitivity: 1, yaw: getGame('cs2').yaw }),
    51.95454545454545
  );

  approx(
    convertSensitivity({ from: 'cs2', to: 'valorant', sensitivity: 1, dpi: 800 }),
    0.3142857142857143
  );

  approx(
    convertSensitivity({ from: 'valorant', to: 'cs2', sensitivity: 0.3142857142857143, dpi: 800 }),
    1
  );

  approx(
    convertSensitivity({ from: 'cs2', to: 'valorant', sensitivity: 1, dpi: 800, targetDpi: 1600 }),
    0.15714285714285714
  );

  approx(
    convertSensitivity({ from: 'cs2', to: 'apex', sensitivity: 1.2, dpi: 800 }),
    1.2
  );

  approx(
    convertSensitivity({ from: 'valorant', to: 'apex', sensitivity: 0.3, dpi: 800 }),
    0.9545454545454546
  );

  assert.throws(() => edpi(0, 1), /dpi must be positive/);
  assert.throws(() => edpi(800, -1), /sensitivity must be positive/);
  assert.throws(
    () => convertSensitivity({ from: 'missing', to: 'valorant', sensitivity: 1, dpi: 800 }),
    /Missing game constant/
  );

  console.log('Formula tests passed.');
}

run();
