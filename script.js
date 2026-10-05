const API = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 20;

const TYPE_COLORS = {
  normal: "tan",
  fire: "orange",
  water: "cornflowerblue",
  electric: "gold",
  grass: "yellowgreen",
  ice: "paleturquoise",
  fighting: "firebrick",
  poison: "purple",
  ground: "goldenrod",
  flying: "mediumpurple",
  psychic: "hotpink",
  bug: "olivedrab",
  rock: "darkgoldenrod",
  ghost: "rebeccapurple",
  dragon: "blueviolet",
  dark: "sienna",
  steel: "lightsteelblue",
  fairy: "plum"
};

const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const pageLabel = document.getElementById("page-label");
const message = document.getElementById("message");
const messageText = document.getElementById("message-text");

let offset = 0;
let total = 0;
let loaded = [];

async function loadPage() {
  statusEl.textContent = "Loading Pokémon…";
  grid.innerHTML = "";
  prevBtn.disabled = nextBtn.disabled = true;

  try {
    const listRes = await fetch(`${API}?limit=${LIMIT}&offset=${offset}`);
    if (!listRes.ok) throw new Error("List request failed");
    const list = await listRes.json();
    total = list.count;

    loaded = await Promise.all(
      list.results.map(async (p) => {
        const res = await fetch(p.url);
        if (!res.ok) throw new Error("Detail request failed");
        return res.json();
      })
    );

    statusEl.textContent = "";
    render();
  } catch (err) {
    statusEl.textContent = "Could not load Pokémon. Check your connection and try again.";
    console.error(err);
  }

  const page = offset / LIMIT + 1;
  pageLabel.textContent = `Page ${page} of ${Math.ceil(total / LIMIT) || 1}`;
  prevBtn.disabled = offset === 0;
  nextBtn.disabled = offset + LIMIT >= total;
}

function render() {
  const term = searchEl.value.trim().toLowerCase();
  const shown = loaded.filter((p) => p.name.includes(term));

  grid.innerHTML = "";
  statusEl.textContent = shown.length ? "" : `No Pokémon on this page match "${term}".`;

  shown.forEach((p) => grid.appendChild(createCard(p)));
}

function createCard(p) {
  const card = document.createElement("article");
  card.className = "card";
  const mainType = p.types[0].type.name;
  card.style.setProperty("--type", TYPE_COLORS[mainType] || "#777");

  const img = document.createElement("img");
  img.src = p.sprites.other["official-artwork"].front_default || p.sprites.front_default;
  img.alt = p.name;
  img.loading = "lazy";

  const id = document.createElement("span");
  id.className = "id";
  id.textContent = `#${p.id}`;

  const name = document.createElement("h2");
  name.textContent = p.name;

  const types = document.createElement("div");
  types.className = "types";
  p.types.forEach((t) => {
    const s = document.createElement("span");
    s.className = "type";
    s.textContent = t.type.name;
    types.appendChild(s);
  });

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${p.height / 10} m · ${p.weight / 10} kg`;

  const btn = document.createElement("button");
  btn.textContent = "Say hello";
  btn.addEventListener("click", () => {
    const abilities = p.abilities.map((a) => a.ability.name).join(" and ");
    showMessage(`I am ${p.name} and I have ${abilities}.`);
  });

  card.append(id, img, name, types, meta, btn);
  return card;
}

function showMessage(text) {
  messageText.textContent = text;
  message.hidden = false;
}
document.getElementById("message-close").addEventListener("click", () => (message.hidden = true));

searchEl.addEventListener("input", render);

prevBtn.addEventListener("click", () => {
  offset = Math.max(0, offset - LIMIT);
  searchEl.value = "";
  loadPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
nextBtn.addEventListener("click", () => {
  offset += LIMIT;
  searchEl.value = "";
  loadPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

loadPage();