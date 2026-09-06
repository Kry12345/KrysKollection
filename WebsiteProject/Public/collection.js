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
const prevButton = document.getElementById("prevBtn");
const nextButton = document.getElementById("nextBtn");
const loadingCardsText = document.getElementById("loading-cards");

let allCards = [];
let displayCards = [];

let currentSetFilter = [];
let currentSearchQuery = "";

let currentPage = 1;
const cardsPerPage = 12;

let personalServer = "https://kryskollection1.onrender.com/api";

searchInput.addEventListener("input", () => {
    currentSearchQuery = searchInput.value;
    currentPage = 1; // reset to first page on new search/filter
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
    currentPage = 1; // reset to first page on new search/filter
    updateDisplayCards();
});

// Functions run at the start of the webpage load

// Fetch all collection cards from the server
async function fetchCollectionCards() {
    loadingCardsText.hidden = false;
    const response = await fetch(personalServer + "/collection");
    const data = await response.json();

    allCards = await Promise.all(
        data.map(async cardData => {
            try {
                console.log(cardData.id);
                const card = await tcgdex.fetch("cards", cardData.id);
                card.quantity = cardData.quantity; // add quantity so we can show it
                card.reverse_quantity = cardData.reverse_quantity; // add reverse quantity so we can show it
                return card;
            } catch (error) {
                console.error(`Unable to retrieve card ${cardData.id} from TCGdex:`, error);
                return null;
            }
        })
    ).then(cards => cards.filter(card => card !== null));

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
    const highQualityPng = getLowQualityPictureUrl(card);
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
function getLowQualityPictureUrl(card) {
    return card.image + "/low.png";
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
    loadingCardsText.hidden = true;
    const container = document.getElementById("card-container");
    container.innerHTML = "";

    const start = (currentPage - 1) * cardsPerPage;
    const end = start + cardsPerPage;
    const pageCards = displayCards.slice(start, end);

    for (let cardData of pageCards)
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

function setupPagination() {
    const pageNumbers = document.getElementById("pageNumbers");
    pageNumbers.innerHTML = "";

    const pageCount = Math.ceil(displayCards.length / cardsPerPage);
    const maxVisible = 7;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    // Fix if we go past the total pages
    if (endPage > pageCount) {
        endPage = pageCount;
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (currentPage == 1)
    {
        prevButton.disabled = true;
    }
    else
    {
        prevButton.disabled = false;
    }

    if (currentPage == pageCount)
    {
        nextButton.disabled = true;
    }
    else
    {
        nextButton.disabled = false;
    }

    // Optional: show "..." before
    if (startPage > 1) {
        const dots = document.createElement("span");
        dots.innerText = "... ";
        pageNumbers.appendChild(dots);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;

        if (i === currentPage) btn.classList.add("active");

        btn.onclick = () => {
            currentPage = i;
            showCollectionCards();
            setupPagination();
        };

        pageNumbers.appendChild(btn);
    }

    // Optional: show "..." after
    if (endPage < pageCount) {
        const dots = document.createElement("span");
        dots.innerText = " ...";
        pageNumbers.appendChild(dots);
    }
}

async function updateDisplayCards() {
    displayCards = allCards; // RESET before filtering

    await filterSets(currentSetFilter);
    await searchCollectionCards(currentSearchQuery);

    

    showCollectionCards();
    setupPagination();
}

prevButton.onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        showCollectionCards();
        setupPagination();
    }
};

nextButton.onclick = () => {
    const pageCount = Math.ceil(displayCards.length / cardsPerPage);
    if (currentPage < pageCount) {
        currentPage++;
        showCollectionCards();
        setupPagination();
    }
};

fetchCollectionCards().then(() => {
    updateDisplayCards();
});


createFilters();