const tcgdex = new TCGdex("en");

let allCards = [];
let displayCards = [];

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  console.log("Searching for: " + searchInput.value);
    searchCollectionCards(searchInput.value).then(() => {
        showCollectionCards();
    });
});

async function fetchCollection() {
    const collectionData = await fetch('http://localhost:3000/api/collectionCard');
    const data = await collectionData.json();

    allCards = await Promise.all(
        data.map(async cardData => {
            const card = await tcgdex.fetch("cards", cardData.id);
            return card;
        })
    );

    displayCards = allCards; // initially show all cards
    console.log("Fetched all cards:", allCards);
}

async function formatCardHtml(card) {
    const highQualityPng = getHighQualityPictureUrl(card);
    html = `<h2>${card.name}</h2>
        <img src="${highQualityPng}" alt="${card.name}" width="250">
        <p>Set: ${card.set.name}</p>`;
    return html;
}

function getHighQualityPictureUrl(card) {
    return card.image + "/high.png";
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

        cardElem.innerHTML = html;
        
        cardElem.addEventListener("click", () => {
            // do something when the card is clicked
            console.log("Clicked card:", cardData.id);
            // example: navigate to a detail page
            window.location.href = `card.html?id=${cardData.id}`;
        });

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

// Add this:

async function init()
{
    await fetchCollection();
    await showCollectionCards();
}

init();


