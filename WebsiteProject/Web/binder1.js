const tcgdex = new TCGdex("en");

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  console.log("Searching for: " + searchInput.value);
    searchCollectionCards(searchInput.value).then(() => {
        showCollectionCards();
    });
});

let allCards = [];
let displayCards = [];

async function fetchAllCards() {
    const response = await fetch('http://localhost:3000/api/collectionCard/151');
    const data = await response.json();

    allCards = await Promise.all(
        data.map(async cardData => {
            const card = await tcgdex.fetch("cards", cardData.id);
            card.quantity = cardData.quantity; // add quantity so we can show it
            card.reverse_quantity = cardData.reverse_quantity; // add reverse_quantity so we can show it
            return card;
        })
    );
    displayCards = allCards; // initially show all cards
    console.log("Fetched all cards:", allCards);
}

async function showCollectionCards() {
    console.log("Getting collection cards...");
    const container = document.getElementById("card-container");
    container.innerHTML = "";
    for (let cardData of displayCards)
    {
        const cardElem = document.createElement("div");
        cardElem.classList.add("card"); // add your CSS class
        
        let html = '';
        html += await formatCardHtml(cardData);
        html += `<p>quantity: ${cardData.quantity}</p>`;

        cardElem.innerHTML = html;
        container.appendChild(cardElem);
    }
    // display it on the page…
    //document.getElementById("card-container").innerHTML = html;
}

async function searchCollectionCards(query) {
    displayCards = allCards.filter(card =>
    card.name.toLowerCase().includes(query.toLowerCase())
);
}

async function formatCardHtml(card) {
    const highQualityPng = getHighQualityPictureUrl(card);
    html = `<h2>${card.name}</h2>
        <img src="${highQualityPng}" alt="${card.name}" width="250">
        <p>Set: ${card.set.name}</p>
        <p>HP: ${card.hp}</p>
        <p>Types: ${card.types}</p>
        <p>id: ${card.id}</p>`;
    if (card.reverse_quantity !== null) {
        html += `<p>Reverse Quantity: ${card.reverse_quantity}</p>`;
    }
    return html;
}

function getHighQualityPictureUrl(card) {
    return card.image + "/high.png";
}

async function init() {
    await fetchAllCards();
    await showCollectionCards();
}

init();
