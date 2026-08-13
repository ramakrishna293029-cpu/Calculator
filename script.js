const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const buttons = document.querySelectorAll("button");

let expression = "";
let shouldResetDisplay = false;

const operators = ["+", "-", "*", "/"];

function updateDisplay() {
  expressionEl.textContent = expression ? formatExpression(expression) : "\u00a0";
  resultEl.textContent = expression || expression === "0" ? formatExpression(expression) : "0";
}

function formatExpression(value) {
  return String(value).replaceAll("*", "\u00d7").replaceAll("/", "\u00f7");
}

function isOperator(char) {
  return operators.includes(char);
}

function getLastNumber() {
  const parts = expression.split(/[+\-*/]/);
  return parts[parts.length - 1];
}

function addValue(value) {
  if (resultEl.textContent === "Error") {
    clearCalculator();
  }

  if (shouldResetDisplay && !isOperator(value)) {
    expression = "";
    shouldResetDisplay = false;
  }

  if (value === ".") {
    const lastNumber = getLastNumber();
    if (lastNumber.includes(".")) return;
    expression += lastNumber === "" ? "0." : ".";
    updateDisplay();
    return;
  }

  if (isOperator(value)) {
    shouldResetDisplay = false;

    if (expression === "") {
      if (value === "-") {
        expression = "-";
        updateDisplay();
      }
      return;
    }

    const lastChar = expression.at(-1);
    if (isOperator(lastChar)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }

    updateDisplay();
    return;
  }

  expression += value;
  updateDisplay();
}

function clearCalculator() {
  expression = "";
  shouldResetDisplay = false;
  expressionEl.textContent = "\u00a0";
  resultEl.textContent = "0";
}

function deleteLast() {
  if (resultEl.textContent === "Error" || shouldResetDisplay) {
    clearCalculator();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}

function calculate() {
  if (!expression) return;

  try {
    if (isOperator(expression.at(-1))) {
      expression = expression.slice(0, -1);
    }

    if (!expression) {
      clearCalculator();
      return;
    }

    const result = Function(`"use strict"; return (${expression})`)();

    if (!Number.isFinite(result)) {
      showError();
      return;
    }

    expressionEl.textContent = formatExpression(expression);
    expression = String(Number.parseFloat(result.toFixed(12)));
    resultEl.textContent = expression;
    shouldResetDisplay = true;
  } catch {
    showError();
  }
}

function showError() {
  expression = "";
  shouldResetDisplay = true;
  expressionEl.textContent = "\u00a0";
  resultEl.textContent = "Error";
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value) addValue(value);
    if (action === "clear") clearCalculator();
    if (action === "delete") deleteLast();
    if (action === "calculate") calculate();
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^\d$/.test(key)) addValue(key);
  if (["+", "-", "*", "/"].includes(key)) addValue(key);
  if (key === ".") addValue(".");
  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  }
  if (key === "Backspace") deleteLast();
  if (key === "Escape") clearCalculator();
});

updateDisplay();
