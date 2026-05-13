const form = document.querySelector("#rideForm");
const dateInput = document.querySelector("#date");
const timeInput = document.querySelector("#time");
const pickupInput = document.querySelector("#pickup");
const destinationInput = document.querySelector("#destination");
const promoInput = document.querySelector("#promo");
const commonPrice = document.querySelector("#commonPrice");
const premiumPrice = document.querySelector("#premiumPrice");
const tripPrice = document.querySelector("#tripPrice");
const tripStatus = document.querySelector("#tripStatus");
const tripTitle = document.querySelector("#tripTitle");
const mapPickup = document.querySelector("#mapPickup");
const mapDestination = document.querySelector("#mapDestination");
const progressSteps = [...document.querySelectorAll("#progressSteps span")];
const carDot = document.querySelector(".car-dot");
const sosDialog = document.querySelector("#sosDialog");
const sosButton = document.querySelector("#sosButton");
const copySos = document.querySelector("#copySos");
const shareButton = document.querySelector("#shareButton");
const rateButton = document.querySelector("#rateButton");
const toast = document.querySelector("#toast");
const planButtons = [...document.querySelectorAll(".plan")];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const promoDiscounts = {
  none: 0,
  student: 0.12,
  pregnant: 0.1,
  child: 0.08,
  pcd: 0.15,
  autism: 0.15,
  obesity: 0.1,
};

const promoNames = {
  none: "sem promoção",
  student: "estudante",
  pregnant: "gestante",
  child: "crianças e excursões",
  pcd: "pessoa com deficiência",
  autism: "pessoa com autismo",
  obesity: "pessoa com obesidade",
};

let currentRide = {
  pickup: pickupInput.value,
  destination: destinationInput.value,
  type: "common",
  total: 18.5,
};

function setInitialSchedule() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const minutes = String(Math.ceil(now.getMinutes() / 5) * 5).padStart(2, "0");
  dateInput.value = today;
  timeInput.value = `${String(now.getHours()).padStart(2, "0")}:${minutes === "60" ? "55" : minutes}`;
}

function estimateDistance() {
  const seed = `${pickupInput.value.trim()}-${destinationInput.value.trim()}`.length;
  return 5 + (seed % 9);
}

function calculatePrices() {
  const distance = estimateDistance();
  const discount = promoDiscounts[promoInput.value] || 0;
  const nightSafety = document.querySelector("#nightSafety").checked ? 3 : 0;
  const common = Math.max(10, 8 + distance * 1.75 + nightSafety) * (1 - discount);
  const premium = Math.max(16, 12 + distance * 2.45 + 5 + nightSafety) * (1 - discount);

  commonPrice.textContent = currency.format(common);
  premiumPrice.textContent = currency.format(premium);

  const selectedType = new FormData(form).get("type");
  const total = selectedType === "premium" ? premium : common;
  tripPrice.textContent = currency.format(total);

  return { common, premium, selectedType, total, distance };
}

function updateMapLabels() {
  mapPickup.textContent = pickupInput.value.trim() || "Origem";
  mapDestination.textContent = destinationInput.value.trim() || "Destino";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function setStep(index) {
  progressSteps.forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex <= index);
  });
}

function simulateTrip(event) {
  event.preventDefault();
  const { selectedType, total, distance } = calculatePrices();
  updateMapLabels();

  const pickup = pickupInput.value.trim() || "origem";
  const destination = destinationInput.value.trim() || "destino";
  const typeName = selectedType === "premium" ? "Premium" : "Comum";
  const schedule = dateInput.value && timeInput.value ? ` para ${dateInput.value.split("-").reverse().join("/")} às ${timeInput.value}` : "";

  currentRide = { pickup, destination, type: typeName, total };
  tripStatus.textContent = "Pedido simulado criado";
  tripTitle.textContent = `${typeName}: ${pickup} até ${destination}`;
  tripPrice.textContent = currency.format(total);
  carDot.classList.add("running");
  setStep(0);
  showToast(`Corrida ${typeName} simulada${schedule}. Distância estimada: ${distance} km.`);

  const timeline = [
    ["Motorista Marina aceita em 2 min", 1],
    ["Em rota com localização compartilhada", 2],
    ["Chegada simulada. Nenhum pagamento foi feito.", 3],
  ];

  timeline.forEach(([status, step], index) => {
    window.setTimeout(() => {
      tripStatus.textContent = status;
      setStep(step);
      if (step === 3) {
        carDot.classList.remove("running");
      }
    }, 1800 * (index + 1));
  });
}

function buildShareMessage() {
  const promo = promoNames[promoInput.value] || "sem promoção";
  const promoText = promoInput.value === "none" ? "sem promoção aplicada" : `com prioridade para ${promo}`;
  return `LadyDrive simulado: ${currentRide.type} de ${currentRide.pickup} até ${currentRide.destination}. Valor estimado ${currency.format(currentRide.total)} ${promoText}. Motorista sugerida: Marina Lopes. Nenhuma corrida real foi chamada.`;
}

async function copyText(message, feedback) {
  try {
    await navigator.clipboard.writeText(message);
    showToast(feedback);
  } catch {
    showToast("Não consegui copiar automaticamente, mas a mensagem foi gerada.");
  }
}

form.addEventListener("input", () => {
  calculatePrices();
  updateMapLabels();
});

form.addEventListener("submit", simulateTrip);

sosButton.addEventListener("click", () => {
  sosDialog.showModal();
});

copySos.addEventListener("click", () => {
  copyText(`SOS LadyDrive simulado. ${buildShareMessage()}`, "Mensagem de SOS simulada copiada.");
});

shareButton.addEventListener("click", () => {
  copyText(buildShareMessage(), "Mensagem de compartilhamento copiada.");
});

rateButton.addEventListener("click", () => {
  showToast("Obrigada pela avaliação: 5 estrelas simuladas para Marina Lopes.");
});

planButtons.forEach((button) => {
  button.addEventListener("click", () => {
    planButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    showToast(`Pacote selecionado: ${button.querySelector("strong").textContent}.`);
  });
});

setInitialSchedule();
calculatePrices();
updateMapLabels();
