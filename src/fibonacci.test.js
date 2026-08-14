"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  fibonacci,
  sequencia,
  sequenciaAte,
  isFibonacci,
  razaoAureaAproximada,
  serializar,
} = require("./fibonacci");

describe("fibonacci", () => {
  it("calcula os primeiros termos", () => {
    assert.equal(fibonacci(0), 0n);
    assert.equal(fibonacci(1), 1n);
    assert.equal(fibonacci(2), 1n);
    assert.equal(fibonacci(10), 55n);
    assert.equal(fibonacci(20), 6765n);
  });

  it("rejeita valores inválidos", () => {
    assert.throws(() => fibonacci(-1), /inteiro/);
    assert.throws(() => fibonacci(1.5), /inteiro/);
    assert.throws(() => fibonacci(2001), /maior que/);
  });
});

describe("sequencia", () => {
  it("gera a quantidade pedida de termos", () => {
    assert.deepEqual(sequencia(0), []);
    assert.deepEqual(sequencia(1), [0n]);
    assert.deepEqual(sequencia(2), [0n, 1n]);
    assert.deepEqual(sequencia(8), [0n, 1n, 1n, 2n, 3n, 5n, 8n, 13n]);
  });

  it("sequenciaAte inclui o índice final", () => {
    assert.deepEqual(sequenciaAte(5), [0n, 1n, 1n, 2n, 3n, 5n]);
  });
});

describe("isFibonacci", () => {
  it("reconhece números da sequência", () => {
    assert.equal(isFibonacci(0), true);
    assert.equal(isFibonacci(1), true);
    assert.equal(isFibonacci(21), true);
    assert.equal(isFibonacci(22), false);
    assert.equal(isFibonacci(-8), false);
  });
});

describe("razaoAureaAproximada", () => {
  it("aproxima phi para n alto", () => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const aproximacao = razaoAureaAproximada(20);
    assert.ok(aproximacao !== null);
    assert.ok(Math.abs(aproximacao - phi) < 0.001);
  });
});

describe("serializar", () => {
  it("converte bigint e listas para string", () => {
    assert.equal(serializar(55n), "55");
    assert.deepEqual(serializar([0n, 1n, 1n]), ["0", "1", "1"]);
  });
});