const paymentForm = document.getElementById("payment");
const paymentKey = "energym.cuotas.demo.v1";
const roster = document.getElementById("person");
for (const option of roster.options) paymentForm.elements.pupil.add(option.cloneNode(true));
function readPayments() {
  return JSON.parse(localStorage.getItem(paymentKey) || "[]");
}
function formatDate(value) { return value.split("-").reverse().join("/"); }
function paymentState(due, date) {
  if (!due) return "Sin pago registrado";
  if (due < date) return "Vencido";
  if (due === date) return "Vence hoy";
  return "Al día";
}
function renderPayments() {
  const payments = readPayments().reverse().sort((a,b) => b.paid.localeCompare(a.paid));
  const balances = document.getElementById("balances");
  balances.replaceChildren();
  for (const option of roster.options) {
    const current = payments.find(p => p.pupil === option.value);
    const row = balances.insertRow();
    row.insertCell().textContent = option.value;
    const state = row.insertCell();
    state.textContent = paymentState(current?.due,today());
    state.dataset.balance = state.textContent;
    row.insertCell().textContent = current ? formatDate(current.due) : "—";
  }
  const list = document.getElementById("payments-list");
  list.replaceChildren();
  if (!payments.length) list.textContent = "Todavía no hay pagos registrados.";
  for (const p of payments) {
    const line = document.createElement("p");
    const amount = Number(p.amount).toLocaleString("es-AR",{style:"currency",currency:"ARS"});
    line.textContent = [p.pupil,p.concept,amount,"Pagó el "+formatDate(p.paid),"Vence el "+formatDate(p.due)].join(" · ");
    list.append(line);
  }
  const fields = paymentForm.elements;
  fields.paid.max = today();
  if (!fields.paid.value) fields.paid.value = today();
  fields.due.min = fields.paid.value;
}
paymentForm.elements.paid.onchange = () => { paymentForm.elements.due.min = paymentForm.elements.paid.value; };
paymentForm.onsubmit = event => {
  event.preventDefault();
  const payment = Object.fromEntries(new FormData(paymentForm));
  const payments = readPayments();
  payments.push(payment);
  localStorage.setItem(paymentKey,JSON.stringify(payments));
  paymentForm.reset();
  renderPayments();
  document.getElementById("payment-status").textContent = "Pago registrado para "+payment.pupil+".";
};
