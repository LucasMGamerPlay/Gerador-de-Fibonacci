"use strict";

const path = require("path");
const express = require("express");
const {
  MAX_N,
  fibonacci,
  sequencia,
  sequenciaAte,
  isFibonacci,
  razaoAureaAproximada,
  serializar,
} = require("./fibonacci");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, "..", "public");

app.use(express.json());
app.use(express.static(publicDir));

function lerInteiro(valor, nome) {
  if (valor === undefined || valor === null || valor === "") {
    throw new Error(`${nome} é obrigatório`);
  }
  const numero = Number(valor);
  if (!Number.isInteger(numero)) {
    throw new Error(`${nome} deve ser um inteiro`);
  }
  return numero;
}

function responderErro(res, erro) {
  const status = /obrigatório|inteiro|maior que/.test(erro.message) ? 400 : 500;
  res.status(status).json({ ok: false, erro: erro.message });
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    servico: "fibonacci-interface",
    maxN: MAX_N,
  });
});

app.get("/api/fibonacci/:n", (req, res) => {
  try {
    const n = lerInteiro(req.params.n, "n");
    const valor = fibonacci(n);
    res.json({
      ok: true,
      modo: "termo",
      n,
      valor: serializar(valor),
      phi: razaoAureaAproximada(n),
    });
  } catch (erro) {
    responderErro(res, erro);
  }
});

app.get("/api/sequencia", (req, res) => {
  try {
    const quantidade = lerInteiro(req.query.quantidade ?? req.query.n, "quantidade");
    const termos = sequencia(quantidade);
    res.json({
      ok: true,
      modo: "sequencia",
      quantidade,
      termos: serializar(termos),
    });
  } catch (erro) {
    responderErro(res, erro);
  }
});

app.get("/api/sequencia-ate/:n", (req, res) => {
  try {
    const n = lerInteiro(req.params.n, "n");
    const termos = sequenciaAte(n);
    res.json({
      ok: true,
      modo: "sequencia-ate",
      n,
      termos: serializar(termos),
    });
  } catch (erro) {
    responderErro(res, erro);
  }
});

app.post("/api/verificar", (req, res) => {
  try {
    const valor = req.body?.valor;
    if (valor === undefined || valor === null || valor === "") {
      throw new Error("valor é obrigatório");
    }
    const texto = String(valor).trim();
    if (!/^-?\d+$/.test(texto)) {
      throw new Error("valor deve ser um inteiro");
    }
    const pertence = isFibonacci(BigInt(texto));
    res.json({
      ok: true,
      modo: "verificar",
      valor: texto,
      pertence,
    });
  } catch (erro) {
    responderErro(res, erro);
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Interface Fibonacci em http://localhost:${PORT}`);
});