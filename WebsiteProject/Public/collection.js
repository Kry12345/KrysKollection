const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    if (token) {
        // user is logged in
        const loginBtnLink = document.getElementById("loginBtnLink");
        loginBtnLink.textContent = "Update Collection";
        loginBtnLink.href = "admin_updateCollection.html";
    }
});


const tcgdex = new TCGdex("en");

const searchInput = document.getElementById("collection-search");

let allCards = [];
let displayCards = [];

let currentSetFilter = [];
let currentSearchQuery = "";

let personalServer = "http://localhost:3000/api";

searchInput.addEventListener("input", () => {
    currentSearchQuery = searchInput.value;
    updateDisplayCards();
});

// Initialize Select2 on the set-filter select element
$(document).ready(function() {
    $('#set-filter').select2({
        placeholder: "Select Types"
    });
});

$('#set-filter').on('change', function () {
    const selectedValues = $(this).val(); // array or null
    currentSetFilter = selectedValues || [];
    updateDisplayCards();
});

// Functions run at the start of the webpage load

// Fetch all collection cards from the server
async function fetchCollectionCards() {
    const response = await fetch(personalServer + "/collection");
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

// Automatically creates filters rather than hardcoding them
async function createFilters() {
    const allSets = await tcgdex.fetch("sets");
    const setData = await fetch(personalServer + "/setData");
    const setDataJson = await setData.json();
    console.log("Fetched set data:", setDataJson);
    setFilter = document.getElementById("set-filter");
    setDataJson.forEach(async set => {
        const option = document.createElement("option");
        option.value = set.setId;
        const setInfo = await tcgdex.fetch("sets", set.setId);
        const setName = setInfo ? setInfo.name : set.setId;
        option.text = setName + " (" + set.unique_quantity + ")";
        setFilter.appendChild(option);
    });
}


// helper functions

//format card HTML
function formatCardHtml(card) {
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

// Get high quality picture URL
function getHighQualityPictureUrl(card) {
    return card.image + "/high.png";
}

async function searchCollectionCards(query) {
    displayCards = displayCards.filter(card =>
        card.name.toLowerCase().includes(query.toLowerCase())
    );
}

async function filterSets(selectedValues) {
    console.log("Filtering for sets:", selectedValues);
    if (selectedValues && selectedValues.length > 0) {
        displayCards = allCards.filter(card => selectedValues.includes(card.set.id));
    } else {
        displayCards = allCards;
    }
}



// Function to update displayed cards based on search input
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
}

async function updateDisplayCards() {
    filterSets(currentSetFilter).then(() => {
        searchCollectionCards(currentSearchQuery).then(() => {
            showCollectionCards();
        });
    });
}

fetchCollectionCards().then(() => {
    showCollectionCards();
});


createFilters();