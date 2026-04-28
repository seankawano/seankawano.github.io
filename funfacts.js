let facts = [];
let currentFact = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("art.json");
  facts = await response.json();

  updateFact();
});

function updateFact() {
  const fact = facts[currentFact];

  const textEl = document.getElementById("fact-text");
  const imgEl = document.getElementById("fact-image");
  const popupEl = document.getElementById("info-popup");

  // Reset fade
  textEl.classList.remove("fade-out");
  imgEl.classList.remove("fade-out");

  // Update text immediately
  textEl.textContent = fact.text;

  // Hide popup when switching
  popupEl.classList.add("hidden");
  popupEl.textContent = fact.moreInfo;

  // Remove old orientation classes
  imgEl.classList.remove("landscape", "portrait");

  // Load image and detect orientation AFTER it loads
  imgEl.onload = () => {
    if (imgEl.naturalWidth >= imgEl.naturalHeight) {
      imgEl.classList.add("landscape");
    } else {
      imgEl.classList.add("portrait");
    }

    // Fade back in AFTER orientation is applied
    imgEl.classList.remove("fade-out");
    textEl.classList.remove("fade-out");
  };

  // Trigger fade-out before switching
  imgEl.classList.add("fade-out");
  textEl.classList.add("fade-out");

  // Set the new image source (this triggers onload)
  imgEl.src = fact.image;
}




function fadeAndSwitch(changeIndex) {
  const textEl = document.getElementById("fact-text");
  const imgEl = document.getElementById("fact-image");

  textEl.classList.add("fade-out");
  imgEl.classList.add("fade-out");

  setTimeout(() => {
    changeIndex();
    updateFact();
  }, 400);
}

window.nextFact = () => {
  fadeAndSwitch(() => {
    currentFact = (currentFact + 1) % facts.length;
  });
};

window.prevFact = () => {
  fadeAndSwitch(() => {
    currentFact = (currentFact - 1 + facts.length) % facts.length;
  });
};

window.toggleInfo = () => {
  const popup = document.getElementById("info-popup");
  popup.classList.toggle("hidden");
};

async function initTravelMap() {
  const map = L.map('travel-map').setView([20, 0], 2);
  const usBounds = [
    [24.396308, -124.848974], // Southwest corner
    [49.384358, -66.885444]   // Northeast corner
    ];

    map.fitBounds(usBounds);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);


  // Load your travel data
  const travelData = await fetch('places.json').then(r => r.json());

  // --- 1. Add visited/planned city markers ---
  travelData.cities.forEach(city => {
    L.marker([city.lat, city.lng])
      .addTo(map)
      .bindPopup(`<strong>${city.name}</strong><br>${city.reason}`);
  });

    travelData.planned.cities.forEach(city => {
    L.marker([city.lat, city.lng])
      .addTo(map)
      .bindPopup(`<strong>${city.name}</strong><br>${city.reason}`);
  });



  // --- 3. Highlight visited/planned U.S. states ---
    const statesGeo = await fetch("data/states.geojson").then(r => r.json());

  L.geoJSON(statesGeo, {
  style: feature => {
    const code = feature.properties.NAME;

    const visited = travelData.states.includes(code);
    const planned = travelData.planned.states.includes(code);

    if (visited) {
      return {
        color: "lime",
        weight: 1,
        fillColor: "lime",
        fillOpacity: 0.35
      };
    }

    if (planned) {
      return {
        color: "yellow",
        weight: 1,
        fillColor: "yellow",
        fillOpacity: 0.25
      };
    }

    return {
      color: "#999",
      weight: 1,
      fillColor: "#ccc",
      fillOpacity: 0.1
    };
    }
    }).addTo(map);


  // --- 5. Highlight visited countries ---
  const countriesGeo = await fetch("data/countries.geojson").then(r => r.json());


  L.geoJSON(countriesGeo, {
  style: feature => {
    const name = feature.properties.name;

    const visited = travelData.countries.includes(name);
    const planned = travelData.planned.countries.includes(name);

    if (visited) {
      return {
        color: "green",
        weight: 2,
        fillColor: "green",
        fillOpacity: 0.35
      };
    }

    if (planned) {
      return {
        color: "yellow",
        weight: 2,
        fillColor: "yellow",
        fillOpacity: 0.25
      };
    }

    return {
      color: "#999",
      weight: 1,
      fillColor: "#ccc",
      fillOpacity: 0.05
    };
  }
}).addTo(map);

}

document.addEventListener("DOMContentLoaded", initTravelMap);

