// Hardcoded credentials for demo
const USERS = [
  { email: "admin@smartcity.com", password: "12345", village: "GreenVille" }
];

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const village = document.getElementById("village").value.trim();
  const errorDiv = document.getElementById("loginError");

  const admin = USERS.find(user => user.email === email && user.password === password);

  if (admin) {
    if (village) {
      document.getElementById("loginScreen").style.display = "none";
      document.getElementById("dashboard").style.display = "block";
      document.querySelector("h1").textContent += ` - ${village}`;
    } else {
      errorDiv.textContent = "❌ Please enter your village name.";
    }
  } else {
    errorDiv.textContent = "❌ Invalid email or password.";
  }
}

let barChart, lineChart, pieChart;
let areas = {}, daily = {}, total = 0;
let selectedFile = null;
let csvHeaders = [], mappedColumns = {};
let mailedAreas = new Set();

document.getElementById("csvFile").addEventListener("change", function (event) {
  selectedFile = event.target.files[0];
  if (selectedFile) {
    Papa.parse(selectedFile, {
      header: true,
      preview: 1,
      skipEmptyLines: true,
      complete: function (results) {
        csvHeaders = results.meta.fields;
        populateColumnMappingDropdowns(csvHeaders);
        document.getElementById("columnMapping").style.display = "block";
      },
      error: function (err) {
        alert("Error parsing CSV headers: " + err.message);
      }
    });
  }
});

document.getElementById("mapColumnsBtn").addEventListener("click", function () {
  mappedColumns = {
    area: document.getElementById("areaColumn").value,
    date: document.getElementById("dateColumn").value,
    consumption: document.getElementById("consumptionColumn").value
  };

  areas = {}; daily = {}; total = 0; mailedAreas.clear();

  Papa.parse(selectedFile, {
    header: true,
    skipEmptyLines: true,
    worker: true,
    step: function (row) {
      processRow(row.data, mappedColumns);
    },
    complete: function () {
      finalizeData();
    },
    error: function (err) {
      alert("Error parsing CSV: " + err.message);
    }
  });
});

document.getElementById("threshold").addEventListener("input", function () {
  if (Object.keys(areas).length > 0) showAlerts(areas);
});

function populateColumnMappingDropdowns(headers) {
  const selects = ["areaColumn", "dateColumn", "consumptionColumn"];
  selects.forEach(id => {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">-- Select Column --</option>';
    headers.forEach(header => {
      const option = document.createElement("option");
      option.value = header;
      option.textContent = header;
      select.appendChild(option);
    });
  });
}

function processRow(row, mappedCols) {
  const area = row[mappedCols.area];
  const date = row[mappedCols.date];
  const consumption = parseFloat(row[mappedCols.consumption]) || 0;
  if (!area || !date || isNaN(consumption)) return;

  total += consumption;
  areas[area] = (areas[area] || 0) + consumption;
  daily[date] = (daily[date] || 0) + consumption;
}

function finalizeData() {
  document.getElementById("totalConsumption").textContent = total.toFixed(0);
  document.getElementById("averageConsumption").textContent = (
    total / Object.keys(daily).length
  ).toFixed(0);
  const topArea = Object.keys(areas).reduce((a, b) => areas[a] > areas[b] ? a : b, "N/A");
  document.getElementById("topArea").textContent = topArea;
  document.getElementById("kpiContainer").style.display = "flex";

  showAlerts(areas);
  drawCharts(areas, daily);
  showRecommendations(topArea);
}

function showAlerts(areas) {
  const threshold = parseFloat(document.getElementById("threshold").value);
  const alertContainer = document.getElementById("alertContainer");
  alertContainer.innerHTML = "";
  let highConsumptionAreas = [];

  Object.entries(areas).forEach(([area, value]) => {
    if (value > threshold) {
      highConsumptionAreas.push(`<div class="alert">🚨 <strong>${area}</strong> exceeded threshold (${value.toFixed(0)} kWh)</div>`);
      if (!mailedAreas.has(area)) {
        sendAlertEmail(area, value.toFixed(0), threshold);
        mailedAreas.add(area);
      }
    }
  });

  alertContainer.innerHTML = highConsumptionAreas.length > 0
    ? highConsumptionAreas.join('')
    : `<div class="success">✅ All areas within safe limits.</div>`;
}

function sendAlertEmail(area, usage, threshold) {
    fetch('/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, usage, threshold })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        console.log(`✅ Alert email sent for ${area}`);
    })
    .catch(error => {
        console.error(`❌ Failed to send alert email for ${area}:`, error);
    });
}


function drawCharts(areas, daily) {
  document.getElementById("chartsContainer").style.display = "block";
  if (barChart) barChart.destroy();
  if (lineChart) lineChart.destroy();
  if (pieChart) pieChart.destroy();

  const barCtx = document.getElementById("barChart").getContext("2d");
  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: Object.keys(areas),
      datasets: [{
        label: "Total Consumption (kWh)",
        data: Object.values(areas),
        backgroundColor: "rgba(76, 175, 80, 0.7)"
      }]
    }
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  const sortedDates = Object.keys(daily).sort((a, b) => new Date(a) - new Date(b));
  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: sortedDates,
      datasets: [{
        label: "Daily Consumption (kWh)",
        data: sortedDates.map(date => daily[date]),
        borderColor: "#4CAF50",
        fill: false,
        tension: 0.1
      }]
    }
  });
  


  const pieCtx = document.getElementById("pieChart").getContext("2d");
  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: Object.keys(areas),
      datasets: [{
        data: Object.values(areas),
        backgroundColor: ["#4CAF50", "#FFC107", "#2196F3", "#FF5722", "#9C27B0"]
      }]
    }
  });
}

function showRecommendations(topArea) {
  document.getElementById("recommendationContainer").style.display = "block";
  const list = document.getElementById("recommendationsList");
  list.innerHTML = `
    <li>Encourage ${topArea} to switch to energy-efficient appliances.</li>
    <li>Promote solar panel installation in ${topArea}.</li>
    <li>Implement demand-response programs during peak hours.</li>
    <li>Launch awareness campaigns for smart energy usage.</li>
  `;
}
