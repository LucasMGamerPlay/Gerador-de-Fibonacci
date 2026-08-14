"use strict";

const MAX_N = 2000;

function assertInteiroNaoNegativo(n, nome = "n") {
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0) {
    throw new Error(`${nome} deve ser um inteiro maior ou igual a 0`);
  }
  if (n > MAX_N) {
    throw new Error(`${nome} não pode ser maior que ${MAX_N}`);
  }
}

function toBigInt(n) {
  return typeof n === "bigint" ? n : BigInt(n);
}

/**
 * Retorna o n-ésimo número de Fibonacci (F0 = 0, F1 = 1).
 */
function fibonacci(n) {
  assertInteiroNaoNegativo(n);
  if (n === 0) return 0n;
  if (n === 1) return 1n;

  let anterior = 0n;
  let atual = 1n;

  for (let i = 2; i <= n; i += 1) {
    const proximo = anterior + atual;
    anterior = atual;
    atual = proximo;
  }

  return atual;
}

/**
 * Gera uma sequência com `quantidade` termos a partir de F0.
 */
function sequencia(quantidade) {
  assertInteiroNaoNegativo(quantidade, "quantidade");

  const termos = [];
  let anterior = 0n;
  let atual = 1n;

  for (let i = 0; i < quantidade; i += 1) {
    if (i === 0) {
      termos.push(0n);
      continue;
    }
    if (i === 1) {
      termos.push(1n);
      continue;
    }
    const proximo = anterior + atual;
    anterior = atual;
    atual = proximo;
    termos.push(atual);
  }

  return termos;
}

/**
 * Gera a sequência até o índice `n` (inclusive): F0..Fn.
 */
function sequenciaAte(n) {
  assertInteiroNaoNegativo(n);
  return sequencia(n + 1);
}

function isFibonacci(valor) {
  const alvo = toBigInt(valor);
  if (alvo < 0n) return false;
  if (alvo === 0n || alvo === 1n) return true;

  let anterior = 0n;
  let atual = 1n;

  while (atual < alvo) {
    const proximo = anterior + atual;
    anterior = atual;
    atual = proximo;
  }

  return atual === alvo;
}

function razaoAureaAproximada(n) {
  assertInteiroNaoNegativo(n);
  if (n < 2) return null;
  const atual = fibonacci(n);
  const anterior = fibonacci(n - 1);
  return Number(atual) / Number(anterior);
}

function serializar(valor) {
  if (typeof valor === "bigint") return valor.toString();
  if (Array.isArray(valor)) return valor.map(serializar);
  return valor;
}

module.exports = {
  MAX_N,
  fibonacci,
  sequencia,
  sequenciaAte,
  isFibonacci,
  razaoAureaAproximada,
  serializar,
};