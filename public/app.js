"use strict";

const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".form");
const resultado = document.querySelector("#resultado");
const titulo = document.querySelector("#resultado-titulo");
const meta = document.querySelector("#resultado-meta");
const valorEl = document.querySelector("#resultado-valor");
const chips = document.querySelector("#resultado-chips");
const erroEl = document.querySelector("#erro");

function limpar() {
  erroEl.hidden = true;
  erroEl.textContent = "";
  resultado.hidden = true;
  chips.hidden = true;
  chips.innerHTML = "";
}

function mostrarErro(mensagem) {
  resultado.hidden = true;
  erroEl.hidden = false;
  erroEl.textContent = mensagem;
}

function mostrarResultado({ tituloTexto, metaTexto, valor, termos }) {
  erroEl.hidden = true;
  resultado.hidden = false;
  titulo.textContent = tituloTexto;
  meta.textContent = metaTexto || "";
  valorEl.textContent = valor;

  if (Array.isArray(termos) && termos.length) {
    chips.hidden = false;
    chips.innerHTML = termos
      .map((termo, indice) => `<span class="chip">F<sub>${indice}</sub> ${termo}</span>`)
      .join("");
  }
}

async function pedir(url, opcoes) {
  const resposta = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });
  const dados = await resposta.json();
  if (!resposta.ok || !dados.ok) {
    throw new Error(dados.erro || "Não foi possível concluir o cálculo.");
  }
  return dados;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    forms.forEach((form) => {
      form.classList.toggle("is-visible", form.dataset.panel === tab.dataset.tab);
    });
    limpar();
  });
});

document.querySelector("#form-termo").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limpar();
  const n = evento.currentTarget.n.value;
  try {
    const dados = await pedir(`/api/fibonacci/${encodeURIComponent(n)}`);
    const phi = dados.phi ? ` · φ ≈ ${Number(dados.phi).toFixed(8)}` : "";
    mostrarResultado({
      tituloTexto: `F${dados.n}`,
      metaTexto: `termo isolado${phi}`,
      valor: dados.valor,
    });
  } catch (erro) {
    mostrarErro(erro.message);
  }
});

document.querySelector("#form-sequencia").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limpar();
  const quantidade = evento.currentTarget.quantidade.value;
  try {
    const dados = await pedir(`/api/sequencia?quantidade=${encodeURIComponent(quantidade)}`);
    mostrarResultado({
      tituloTexto: "Sequência",
      metaTexto: `${dados.quantidade} termo(s)`,
      valor: dados.termos.join(", ") || "—",
      termos: dados.termos,
    });
  } catch (erro) {
    mostrarErro(erro.message);
  }
});

document.querySelector("#form-verificar").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limpar();
  const valor = evento.currentTarget.valor.value;
  try {
    const dados = await pedir("/api/verificar", {
      method: "POST",
      body: JSON.stringify({ valor }),
    });
    mostrarResultado({
      tituloTexto: dados.pertence ? "Pertence" : "Não pertence",
      metaTexto: `valor ${dados.valor}`,
      valor: dados.pertence
        ? `${dados.valor} está na sequência de Fibonacci.`
        : `${dados.valor} não está na sequência de Fibonacci.`,
    });
  } catch (erro) {
    mostrarErro(erro.message);
  }
});

const calcExpr = document.querySelector("#calc-expr");
const calcValue = document.querySelector("#calc-value");
const calcKeys = document.querySelector(".calc-keys");

const simbolos = { "+": "+", "-": "−", "*": "×", "/": "÷" };

const calculadora = {
  display: "0",
  acumulado: null,
  operador: null,
  aguardando: false,
  expressao: "",
};

function formatarNumero(valor) {
  if (!Number.isFinite(valor)) return "Erro";
  const texto = String(valor);
  if (texto.includes("e")) return texto;
  const [inteiro, decimal] = texto.split(".");
  const inteiroFmt = Number(inteiro).toLocaleString("pt-BR");
  return decimal !== undefined ? `${inteiroFmt},${decimal.slice(0, 10)}` : inteiroFmt;
}

function atualizarCalculadora() {
  calcExpr.textContent = calculadora.expressao;
  const bruto = Number(calculadora.display);
  calcValue.textContent = calculadora.display === "Erro" ? "Erro" : formatarNumero(bruto);
}

function resetarCalculadora() {
  calculadora.display = "0";
  calculadora.acumulado = null;
  calculadora.operador = null;
  calculadora.aguardando = false;
  calculadora.expressao = "";
  atualizarCalculadora();
}

function inserirDigito(digito) {
  if (calculadora.display === "Erro") resetarCalculadora();
  if (calculadora.aguardando) {
    calculadora.display = digito;
    calculadora.aguardando = false;
  } else if (calculadora.display === "0") {
    calculadora.display = digito;
  } else if (calculadora.display.replace(".", "").length < 16) {
    calculadora.display += digito;
  }
  atualizarCalculadora();
}

function inserirPonto() {
  if (calculadora.display === "Erro") resetarCalculadora();
  if (calculadora.aguardando) {
    calculadora.display = "0.";
    calculadora.aguardando = false;
  } else if (!calculadora.display.includes(".")) {
    calculadora.display += ".";
  }
  atualizarCalculadora();
}

function calcular(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? NaN : a / b;
  return b;
}

function aplicarOperador(op) {
  if (calculadora.display === "Erro") return;
  const atual = Number(calculadora.display);

  if (calculadora.operador && !calculadora.aguardando) {
    const resultadoCalc = calcular(calculadora.acumulado, atual, calculadora.operador);
    if (!Number.isFinite(resultadoCalc)) {
      calculadora.display = "Erro";
      calculadora.acumulado = null;
      calculadora.operador = null;
      calculadora.expressao = "";
      atualizarCalculadora();
      return;
    }
    calculadora.acumulado = resultadoCalc;
    calculadora.display = String(resultadoCalc);
  } else {
    calculadora.acumulado = atual;
  }

  calculadora.operador = op;
  calculadora.aguardando = true;
  calculadora.expressao = `${formatarNumero(calculadora.acumulado)} ${simbolos[op]}`;
  atualizarCalculadora();
}

function igualar() {
  if (calculadora.display === "Erro" || !calculadora.operador || calculadora.aguardando) return;
  const atual = Number(calculadora.display);
  const resultadoCalc = calcular(calculadora.acumulado, atual, calculadora.operador);
  if (!Number.isFinite(resultadoCalc)) {
    calculadora.display = "Erro";
    calculadora.expressao = "";
  } else {
    calculadora.expressao = `${formatarNumero(calculadora.acumulado)} ${simbolos[calculadora.operador]} ${formatarNumero(atual)} =`;
    calculadora.display = String(resultadoCalc);
  }
  calculadora.acumulado = null;
  calculadora.operador = null;
  calculadora.aguardando = true;
  atualizarCalculadora();
}

function inverterSinal() {
  if (calculadora.display === "Erro" || calculadora.display === "0") return;
  calculadora.display = calculadora.display.startsWith("-")
    ? calculadora.display.slice(1)
    : `-${calculadora.display}`;
  atualizarCalculadora();
}

function porcentagem() {
  if (calculadora.display === "Erro") return;
  const atual = Number(calculadora.display);
  const base = calculadora.acumulado ?? 1;
  const resultadoCalc = calculadora.operador && (calculadora.operador === "+" || calculadora.operador === "-")
    ? (base * atual) / 100
    : atual / 100;
  calculadora.display = String(resultadoCalc);
  atualizarCalculadora();
}

function apagar() {
  if (calculadora.display === "Erro") {
    resetarCalculadora();
    return;
  }
  if (calculadora.aguardando) return;
  if (calculadora.display.length <= 1 || (calculadora.display.length === 2 && calculadora.display.startsWith("-"))) {
    calculadora.display = "0";
  } else {
    calculadora.display = calculadora.display.slice(0, -1);
  }
  atualizarCalculadora();
}

if (calcKeys) {
  calcKeys.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button");
    if (!botao) return;
    if (botao.dataset.digit !== undefined) inserirDigito(botao.dataset.digit);
    else if (botao.dataset.op) aplicarOperador(botao.dataset.op);
    else if (botao.dataset.action === "dot") inserirPonto();
    else if (botao.dataset.action === "clear") resetarCalculadora();
    else if (botao.dataset.action === "sign") inverterSinal();
    else if (botao.dataset.action === "percent") porcentagem();
    else if (botao.dataset.action === "back") apagar();
    else if (botao.dataset.action === "equals") igualar();
  });
}

document.addEventListener("keydown", (evento) => {
  const painel = document.querySelector('[data-panel="calculadora"]');
  if (!painel || !painel.classList.contains("is-visible")) return;
  if (evento.target.matches("input, textarea")) return;

  const tecla = evento.key;
  if (/^\d$/.test(tecla)) {
    evento.preventDefault();
    inserirDigito(tecla);
  } else if (tecla === "." || tecla === ",") {
    evento.preventDefault();
    inserirPonto();
  } else if (["+", "-", "*", "/"].includes(tecla)) {
    evento.preventDefault();
    aplicarOperador(tecla);
  } else if (tecla === "Enter" || tecla === "=") {
    evento.preventDefault();
    igualar();
  } else if (tecla === "Escape") {
    evento.preventDefault();
    resetarCalculadora();
  } else if (tecla === "Backspace") {
    evento.preventDefault();
    apagar();
  } else if (tecla === "%") {
    evento.preventDefault();
    porcentagem();
  }
});

const CATEGORIAS = {
  alcalino: {
    rotulo: "Alcalino",
    nota: "Metal alcalino — muito reativo, com um elétron na camada de valência.",
  },
  "alcalino-terroso": {
    rotulo: "Alcalino-terroso",
    nota: "Metal alcalino-terroso — dois elétrons de valência e reatividade alta.",
  },
  "metal-transicao": {
    rotulo: "Metal de transição",
    nota: "Metal de transição — forma íons coloridos e vários estados de oxidação.",
  },
  "pos-transicao": {
    rotulo: "Pós-transição",
    nota: "Metal pós-transição — mais mole e menos reativo que os de transição.",
  },
  semimetal: {
    rotulo: "Semimetal",
    nota: "Semimetal (metalóide) — propriedades intermediárias entre metal e não metal.",
  },
  "nao-metal": {
    rotulo: "Não metal",
    nota: "Não metal — tende a ganhar elétrons e formar ânions ou ligações covalentes.",
  },
  halogenio: {
    rotulo: "Halogênio",
    nota: "Halogênio — altamente reativo, falta um elétron para completar o octeto.",
  },
  "gas-nobre": {
    rotulo: "Gás nobre",
    nota: "Gás nobre — camada de valência completa e baixa reatividade química.",
  },
  lantanideo: {
    rotulo: "Lantanídeo",
    nota: "Lantanídeo — terra rara da série 4f, em geral prateado e reativo.",
  },
  actinideo: {
    rotulo: "Actinídeo",
    nota: "Actinídeo — série 5f; a maioria é radioativa e vários são sintéticos.",
  },
};

const ESTADOS = {
  solido: "Sólido",
  liquido: "Líquido",
  gas: "Gás",
  sintetico: "Sintético",
};

const ELEMENTOS = [
  { z: 1, s: "H", n: "Hidrogênio", m: "1,008", c: "nao-metal", g: 1, p: 1, e: "gas" },
  { z: 2, s: "He", n: "Hélio", m: "4,0026", c: "gas-nobre", g: 18, p: 1, e: "gas" },
  { z: 3, s: "Li", n: "Lítio", m: "6,94", c: "alcalino", g: 1, p: 2, e: "solido" },
  { z: 4, s: "Be", n: "Berílio", m: "9,0122", c: "alcalino-terroso", g: 2, p: 2, e: "solido" },
  { z: 5, s: "B", n: "Boro", m: "10,81", c: "semimetal", g: 13, p: 2, e: "solido" },
  { z: 6, s: "C", n: "Carbono", m: "12,011", c: "nao-metal", g: 14, p: 2, e: "solido" },
  { z: 7, s: "N", n: "Nitrogênio", m: "14,007", c: "nao-metal", g: 15, p: 2, e: "gas" },
  { z: 8, s: "O", n: "Oxigênio", m: "15,999", c: "nao-metal", g: 16, p: 2, e: "gas" },
  { z: 9, s: "F", n: "Flúor", m: "18,998", c: "halogenio", g: 17, p: 2, e: "gas" },
  { z: 10, s: "Ne", n: "Neônio", m: "20,180", c: "gas-nobre", g: 18, p: 2, e: "gas" },
  { z: 11, s: "Na", n: "Sódio", m: "22,990", c: "alcalino", g: 1, p: 3, e: "solido" },
  { z: 12, s: "Mg", n: "Magnésio", m: "24,305", c: "alcalino-terroso", g: 2, p: 3, e: "solido" },
  { z: 13, s: "Al", n: "Alumínio", m: "26,982", c: "pos-transicao", g: 13, p: 3, e: "solido" },
  { z: 14, s: "Si", n: "Silício", m: "28,085", c: "semimetal", g: 14, p: 3, e: "solido" },
  { z: 15, s: "P", n: "Fósforo", m: "30,974", c: "nao-metal", g: 15, p: 3, e: "solido" },
  { z: 16, s: "S", n: "Enxofre", m: "32,06", c: "nao-metal", g: 16, p: 3, e: "solido" },
  { z: 17, s: "Cl", n: "Cloro", m: "35,45", c: "halogenio", g: 17, p: 3, e: "gas" },
  { z: 18, s: "Ar", n: "Argônio", m: "39,948", c: "gas-nobre", g: 18, p: 3, e: "gas" },
  { z: 19, s: "K", n: "Potássio", m: "39,098", c: "alcalino", g: 1, p: 4, e: "solido" },
  { z: 20, s: "Ca", n: "Cálcio", m: "40,078", c: "alcalino-terroso", g: 2, p: 4, e: "solido" },
  { z: 21, s: "Sc", n: "Escândio", m: "44,956", c: "metal-transicao", g: 3, p: 4, e: "solido" },
  { z: 22, s: "Ti", n: "Titânio", m: "47,867", c: "metal-transicao", g: 4, p: 4, e: "solido" },
  { z: 23, s: "V", n: "Vanádio", m: "50,942", c: "metal-transicao", g: 5, p: 4, e: "solido" },
  { z: 24, s: "Cr", n: "Cromo", m: "51,996", c: "metal-transicao", g: 6, p: 4, e: "solido" },
  { z: 25, s: "Mn", n: "Manganês", m: "54,938", c: "metal-transicao", g: 7, p: 4, e: "solido" },
  { z: 26, s: "Fe", n: "Ferro", m: "55,845", c: "metal-transicao", g: 8, p: 4, e: "solido" },
  { z: 27, s: "Co", n: "Cobalto", m: "58,933", c: "metal-transicao", g: 9, p: 4, e: "solido" },
  { z: 28, s: "Ni", n: "Níquel", m: "58,693", c: "metal-transicao", g: 10, p: 4, e: "solido" },
  { z: 29, s: "Cu", n: "Cobre", m: "63,546", c: "metal-transicao", g: 11, p: 4, e: "solido" },
  { z: 30, s: "Zn", n: "Zinco", m: "65,38", c: "metal-transicao", g: 12, p: 4, e: "solido" },
  { z: 31, s: "Ga", n: "Gálio", m: "69,723", c: "pos-transicao", g: 13, p: 4, e: "solido" },
  { z: 32, s: "Ge", n: "Germânio", m: "72,630", c: "semimetal", g: 14, p: 4, e: "solido" },
  { z: 33, s: "As", n: "Arsênio", m: "74,922", c: "semimetal", g: 15, p: 4, e: "solido" },
  { z: 34, s: "Se", n: "Selênio", m: "78,971", c: "nao-metal", g: 16, p: 4, e: "solido" },
  { z: 35, s: "Br", n: "Bromo", m: "79,904", c: "halogenio", g: 17, p: 4, e: "liquido" },
  { z: 36, s: "Kr", n: "Criptônio", m: "83,798", c: "gas-nobre", g: 18, p: 4, e: "gas" },
  { z: 37, s: "Rb", n: "Rubídio", m: "85,468", c: "alcalino", g: 1, p: 5, e: "solido" },
  { z: 38, s: "Sr", n: "Estrôncio", m: "87,62", c: "alcalino-terroso", g: 2, p: 5, e: "solido" },
  { z: 39, s: "Y", n: "Ítrio", m: "88,906", c: "metal-transicao", g: 3, p: 5, e: "solido" },
  { z: 40, s: "Zr", n: "Zircônio", m: "91,224", c: "metal-transicao", g: 4, p: 5, e: "solido" },
  { z: 41, s: "Nb", n: "Nióbio", m: "92,906", c: "metal-transicao", g: 5, p: 5, e: "solido" },
  { z: 42, s: "Mo", n: "Molibdênio", m: "95,95", c: "metal-transicao", g: 6, p: 5, e: "solido" },
  { z: 43, s: "Tc", n: "Tecnécio", m: "(98)", c: "metal-transicao", g: 7, p: 5, e: "sintetico" },
  { z: 44, s: "Ru", n: "Rutênio", m: "101,07", c: "metal-transicao", g: 8, p: 5, e: "solido" },
  { z: 45, s: "Rh", n: "Ródio", m: "102,91", c: "metal-transicao", g: 9, p: 5, e: "solido" },
  { z: 46, s: "Pd", n: "Paládio", m: "106,42", c: "metal-transicao", g: 10, p: 5, e: "solido" },
  { z: 47, s: "Ag", n: "Prata", m: "107,87", c: "metal-transicao", g: 11, p: 5, e: "solido" },
  { z: 48, s: "Cd", n: "Cádmio", m: "112,41", c: "metal-transicao", g: 12, p: 5, e: "solido" },
  { z: 49, s: "In", n: "Índio", m: "114,82", c: "pos-transicao", g: 13, p: 5, e: "solido" },
  { z: 50, s: "Sn", n: "Estanho", m: "118,71", c: "pos-transicao", g: 14, p: 5, e: "solido" },
  { z: 51, s: "Sb", n: "Antimônio", m: "121,76", c: "semimetal", g: 15, p: 5, e: "solido" },
  { z: 52, s: "Te", n: "Telúrio", m: "127,60", c: "semimetal", g: 16, p: 5, e: "solido" },
  { z: 53, s: "I", n: "Iodo", m: "126,90", c: "halogenio", g: 17, p: 5, e: "solido" },
  { z: 54, s: "Xe", n: "Xenônio", m: "131,29", c: "gas-nobre", g: 18, p: 5, e: "gas" },
  { z: 55, s: "Cs", n: "Césio", m: "132,91", c: "alcalino", g: 1, p: 6, e: "solido" },
  { z: 56, s: "Ba", n: "Bário", m: "137,33", c: "alcalino-terroso", g: 2, p: 6, e: "solido" },
  { z: 57, s: "La", n: "Lantânio", m: "138,91", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 58, s: "Ce", n: "Cério", m: "140,12", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 59, s: "Pr", n: "Praseodímio", m: "140,91", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 60, s: "Nd", n: "Neodímio", m: "144,24", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 61, s: "Pm", n: "Promécio", m: "(145)", c: "lantanideo", g: 3, p: 6, e: "sintetico" },
  { z: 62, s: "Sm", n: "Samário", m: "150,36", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 63, s: "Eu", n: "Európio", m: "151,96", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 64, s: "Gd", n: "Gadolínio", m: "157,25", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 65, s: "Tb", n: "Térbio", m: "158,93", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 66, s: "Dy", n: "Disprósio", m: "162,50", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 67, s: "Ho", n: "Hólmio", m: "164,93", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 68, s: "Er", n: "Érbio", m: "167,26", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 69, s: "Tm", n: "Túlio", m: "168,93", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 70, s: "Yb", n: "Itérbio", m: "173,05", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 71, s: "Lu", n: "Lutécio", m: "174,97", c: "lantanideo", g: 3, p: 6, e: "solido" },
  { z: 72, s: "Hf", n: "Háfnio", m: "178,49", c: "metal-transicao", g: 4, p: 6, e: "solido" },
  { z: 73, s: "Ta", n: "Tântalo", m: "180,95", c: "metal-transicao", g: 5, p: 6, e: "solido" },
  { z: 74, s: "W", n: "Tungstênio", m: "183,84", c: "metal-transicao", g: 6, p: 6, e: "solido" },
  { z: 75, s: "Re", n: "Rênio", m: "186,21", c: "metal-transicao", g: 7, p: 6, e: "solido" },
  { z: 76, s: "Os", n: "Ósmio", m: "190,23", c: "metal-transicao", g: 8, p: 6, e: "solido" },
  { z: 77, s: "Ir", n: "Irídio", m: "192,22", c: "metal-transicao", g: 9, p: 6, e: "solido" },
  { z: 78, s: "Pt", n: "Platina", m: "195,08", c: "metal-transicao", g: 10, p: 6, e: "solido" },
  { z: 79, s: "Au", n: "Ouro", m: "196,97", c: "metal-transicao", g: 11, p: 6, e: "solido" },
  { z: 80, s: "Hg", n: "Mercúrio", m: "200,59", c: "metal-transicao", g: 12, p: 6, e: "liquido" },
  { z: 81, s: "Tl", n: "Tálio", m: "204,38", c: "pos-transicao", g: 13, p: 6, e: "solido" },
  { z: 82, s: "Pb", n: "Chumbo", m: "207,2", c: "pos-transicao", g: 14, p: 6, e: "solido" },
  { z: 83, s: "Bi", n: "Bismuto", m: "208,98", c: "pos-transicao", g: 15, p: 6, e: "solido" },
  { z: 84, s: "Po", n: "Polônio", m: "(209)", c: "pos-transicao", g: 16, p: 6, e: "solido" },
  { z: 85, s: "At", n: "Astato", m: "(210)", c: "semimetal", g: 17, p: 6, e: "solido" },
  { z: 86, s: "Rn", n: "Radônio", m: "(222)", c: "gas-nobre", g: 18, p: 6, e: "gas" },
  { z: 87, s: "Fr", n: "Frâncio", m: "(223)", c: "alcalino", g: 1, p: 7, e: "solido" },
  { z: 88, s: "Ra", n: "Rádio", m: "(226)", c: "alcalino-terroso", g: 2, p: 7, e: "solido" },
  { z: 89, s: "Ac", n: "Actínio", m: "(227)", c: "actinideo", g: 3, p: 7, e: "solido" },
  { z: 90, s: "Th", n: "Tório", m: "232,04", c: "actinideo", g: 3, p: 7, e: "solido" },
  { z: 91, s: "Pa", n: "Protactínio", m: "231,04", c: "actinideo", g: 3, p: 7, e: "solido" },
  { z: 92, s: "U", n: "Urânio", m: "238,03", c: "actinideo", g: 3, p: 7, e: "solido" },
  { z: 93, s: "Np", n: "Netúnio", m: "(237)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 94, s: "Pu", n: "Plutônio", m: "(244)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 95, s: "Am", n: "Amerício", m: "(243)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 96, s: "Cm", n: "Cúrio", m: "(247)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 97, s: "Bk", n: "Berquélio", m: "(247)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 98, s: "Cf", n: "Califórnio", m: "(251)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 99, s: "Es", n: "Einstênio", m: "(252)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 100, s: "Fm", n: "Férmio", m: "(257)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 101, s: "Md", n: "Mendelévio", m: "(258)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 102, s: "No", n: "Nobélio", m: "(259)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 103, s: "Lr", n: "Laurêncio", m: "(266)", c: "actinideo", g: 3, p: 7, e: "sintetico" },
  { z: 104, s: "Rf", n: "Rutherfórdio", m: "(267)", c: "metal-transicao", g: 4, p: 7, e: "sintetico" },
  { z: 105, s: "Db", n: "Dúbnio", m: "(268)", c: "metal-transicao", g: 5, p: 7, e: "sintetico" },
  { z: 106, s: "Sg", n: "Seabórgio", m: "(269)", c: "metal-transicao", g: 6, p: 7, e: "sintetico" },
  { z: 107, s: "Bh", n: "Bóhrio", m: "(270)", c: "metal-transicao", g: 7, p: 7, e: "sintetico" },
  { z: 108, s: "Hs", n: "Hássio", m: "(277)", c: "metal-transicao", g: 8, p: 7, e: "sintetico" },
  { z: 109, s: "Mt", n: "Meitnério", m: "(278)", c: "metal-transicao", g: 9, p: 7, e: "sintetico" },
  { z: 110, s: "Ds", n: "Darmstádio", m: "(281)", c: "metal-transicao", g: 10, p: 7, e: "sintetico" },
  { z: 111, s: "Rg", n: "Roentgênio", m: "(282)", c: "metal-transicao", g: 11, p: 7, e: "sintetico" },
  { z: 112, s: "Cn", n: "Copernício", m: "(285)", c: "metal-transicao", g: 12, p: 7, e: "sintetico" },
  { z: 113, s: "Nh", n: "Nihônio", m: "(286)", c: "pos-transicao", g: 13, p: 7, e: "sintetico" },
  { z: 114, s: "Fl", n: "Fleróvio", m: "(289)", c: "pos-transicao", g: 14, p: 7, e: "sintetico" },
  { z: 115, s: "Mc", n: "Moscóvio", m: "(290)", c: "pos-transicao", g: 15, p: 7, e: "sintetico" },
  { z: 116, s: "Lv", n: "Livermório", m: "(293)", c: "pos-transicao", g: 16, p: 7, e: "sintetico" },
  { z: 117, s: "Ts", n: "Tenesso", m: "(294)", c: "halogenio", g: 17, p: 7, e: "sintetico" },
  { z: 118, s: "Og", n: "Oganessônio", m: "(294)", c: "gas-nobre", g: 18, p: 7, e: "sintetico" },
];

function posicaoGrade(el) {
  if (el.z >= 57 && el.z <= 71) return { col: el.z - 54, row: 9 };
  if (el.z >= 89 && el.z <= 103) return { col: el.z - 86, row: 10 };
  return { col: el.g, row: el.p };
}

function blocoElemento(el) {
  if (el.c === "lantanideo" || el.c === "actinideo") return "f";
  if (el.g === 1 || el.g === 2 || el.s === "He") return "s";
  if (el.g >= 13) return "p";
  return "d";
}

function grupoExibido(el) {
  if (el.c === "lantanideo" || el.c === "actinideo") return "3 (série f)";
  return String(el.g);
}

const gradeTabela = document.querySelector("#tabela-periodica");
const legendaTabela = document.querySelector("#tabela-legenda");
const buscaTabela = document.querySelector("#tabela-busca");
const fichaTabela = document.querySelector("#elemento-ficha");

const tabelaEstado = {
  busca: "",
  categoria: "",
  selecionado: null,
};

function celulaCombina(el) {
  const termo = tabelaEstado.busca.trim().toLowerCase();
  const porTexto =
    !termo ||
    el.n.toLowerCase().includes(termo) ||
    el.s.toLowerCase().includes(termo) ||
    String(el.z) === termo;
  const porCat = !tabelaEstado.categoria || el.c === tabelaEstado.categoria;
  return porTexto && porCat;
}

function renderizarFicha(el) {
  if (!fichaTabela) return;
  if (!el) {
    fichaTabela.innerHTML =
      '<p class="ficha-vazio">Selecione um elemento para ver número atômico, massa e classificação.</p>';
    return;
  }

  const cat = CATEGORIAS[el.c];
  fichaTabela.innerHTML = `
    <div class="ficha-corpo">
      <div class="ficha-simbolo" data-cat="${el.c}">${el.s}</div>
      <div>
        <h3 class="ficha-nome">${el.n}</h3>
        <p class="ficha-sub">Z = ${el.z} · massa ${el.m} u</p>
        <dl class="ficha-dados">
          <div>
            <dt>Categoria</dt>
            <dd>${cat.rotulo}</dd>
          </div>
          <div>
            <dt>Grupo</dt>
            <dd>${grupoExibido(el)}</dd>
          </div>
          <div>
            <dt>Período</dt>
            <dd>${el.p}</dd>
          </div>
          <div>
            <dt>Bloco</dt>
            <dd>${blocoElemento(el)}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>${ESTADOS[el.e]}</dd>
          </div>
        </dl>
        <p class="ficha-nota">${cat.nota}</p>
      </div>
    </div>
  `;
}

function renderizarGrade() {
  if (!gradeTabela) return;

  const extras = `
    <div class="el-marcador" style="grid-column:3;grid-row:6" title="Lantanídeos">*</div>
    <div class="el-marcador" style="grid-column:3;grid-row:7" title="Actinídeos">**</div>
    <div class="el-serie" style="grid-column:1/3;grid-row:9">* Lantanídeos</div>
    <div class="el-serie" style="grid-column:1/3;grid-row:10">** Actinídeos</div>
  `;

  const celulas = ELEMENTOS.map((el) => {
    const { col, row } = posicaoGrade(el);
    const ativo = tabelaEstado.selecionado === el.z;
    const dim = !celulaCombina(el);
    return `
      <button
        type="button"
        class="el-celula${dim ? " is-dim" : ""}${ativo ? " is-on" : ""}"
        data-z="${el.z}"
        data-cat="${el.c}"
        style="grid-column:${col};grid-row:${row}"
        title="${el.n} (${el.s})"
        aria-pressed="${ativo}"
      >
        <span class="el-z">${el.z}</span>
        <span class="el-s">${el.s}</span>
        <span class="el-n">${el.n}</span>
      </button>
    `;
  }).join("");

  gradeTabela.innerHTML = extras + celulas;
}

function renderizarLegenda() {
  if (!legendaTabela) return;
  legendaTabela.innerHTML = Object.entries(CATEGORIAS)
    .map(([chave, info]) => {
      const ligado = tabelaEstado.categoria === chave;
      return `
        <button
          type="button"
          class="legenda-item${ligado ? " is-on" : ""}"
          data-cat="${chave}"
          role="listitem"
          aria-pressed="${ligado}"
        >
          <span class="legenda-ponto" style="background:var(--cat-${chave})"></span>
          ${info.rotulo}
        </button>
      `;
    })
    .join("");
}

function iniciarTabela() {
  if (!gradeTabela) return;

  renderizarLegenda();
  renderizarGrade();
  renderizarFicha(null);

  gradeTabela.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".el-celula");
    if (!botao) return;
    const z = Number(botao.dataset.z);
    const el = ELEMENTOS.find((item) => item.z === z);
    tabelaEstado.selecionado = tabelaEstado.selecionado === z ? null : z;
    renderizarGrade();
    renderizarFicha(tabelaEstado.selecionado ? el : null);
  });

  legendaTabela.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".legenda-item");
    if (!botao) return;
    const cat = botao.dataset.cat;
    tabelaEstado.categoria = tabelaEstado.categoria === cat ? "" : cat;
    renderizarLegenda();
    renderizarGrade();
  });

  buscaTabela.addEventListener("input", () => {
    tabelaEstado.busca = buscaTabela.value;
    renderizarGrade();
    const termo = tabelaEstado.busca.trim().toLowerCase();
    if (!termo) return;
    const unico = ELEMENTOS.filter(celulaCombina);
    if (unico.length === 1) {
      tabelaEstado.selecionado = unico[0].z;
      renderizarGrade();
      renderizarFicha(unico[0]);
    }
  });
}

iniciarTabela();