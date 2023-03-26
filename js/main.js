/* Elements and identifiers */
const locationModal = document.querySelector("#welcomeModal");
const locationForm = document.getElementById("location-form");
const locationSelect = document.getElementById("location-select");
const areaSelect = document.getElementById("area-select");
const locationSubmit = document.getElementById("location-submit");
const recoFeedSection = document.querySelector('#recoFeed');
const mainContent = document.getElementById("mainContent");


/* Form handling and general static rendering */
function handleVisibility(e, targetVisibility, targetDisplay = "inline") {
    const displayState = {
        "inline": "d-inline",
        "flex": "d-flex",
        "inline-block": "d-ib",
        "inherit": "d-auto",
        "initial": "d-auto",
        "none": "d-none"
    };
    const currentDisplay = e.style.display;
    let mappedClass = "";

    if (targetVisibility === "hide") {
        e.classList.add("d-none");
        mappedClass = displayState[currentDisplay];
        e.classList.remove(mappedClass);
    } else if (targetVisibility === "show") {
        e.classList.remove("d-none");
        mappedClass = displayState[targetDisplay];
        e.classList.add(mappedClass);
    }
}

function handleLocationForm() {
    areaSelect.setAttribute("disabled", "disabled");
    locationSubmit.setAttribute("disabled", "disabled");
    handleVisibility(areaSelect, "hide");

    const city = locationSelect.value;
    if (city) {
        handleVisibility(areaSelect, "show");
        areaSelect.removeAttribute("disabled");
        getAreaList(city);
        locationSubmit.removeAttribute("disabled");
    }
}


/* Data/Recos loading and rendering */
async function getAreaList(city) {
    const url = `./assets/geo/${city}.json`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`
            Failed to fetch nearby places:
            ${response.status} ${response.statusText}
        `);
    }
    const areas = await response.json();

    areaSelect.innerHTML = "";
    handleVisibility(areaSelect, "show", "inline");
    for (const area of areas) {
        const option = document.createElement("option");
        option.value = area.id;
        option.innerText = area.name;
        if (area.default === true) { option.setAttribute("selected", "selected") }
        areaSelect.appendChild(option);
    }
}

async function getNearbyPlaces(location, radius, type, key) {
    const url = `./tests/nearbyplaces.json`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`
            Failed to fetch nearby places:
            ${response.status} ${response.statusText}
        `);
    }
    const data = await response.json();
    return data.results;
}

async function getPlacePhoto(photoRef) {
    const API_KEY = 'dummy_key';
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photoRef}&key=${API_KEY}`;

    try {
        const response = {
            status: 'OK',
            data: {
                photoUrl: "./assets/img/generic_card.jpg"
            }
        };
        await new Promise(resolve => setTimeout(resolve, 600));
        if (response.status === 'OK') {
            return response.data.photoUrl;
        }
        throw new Error('Unable to fetch place photo');
    } catch (error) {
        console.error(error);
        return null;
    }
}

function printPlaceCard(placeData, photoUrl) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    const cardImg = document.createElement('div');
    cardImg.classList.add('card-image');
    cardDiv.appendChild(cardImg);

    const coverImg = document.createElement('img');
    coverImg.classList.add('cover');
    coverImg.src = photoUrl;
    coverImg.alt = placeData.name;
    cardImg.appendChild(coverImg);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('card-content');
    cardDiv.appendChild(contentDiv);

    const titleH2 = document.createElement('h2');
    titleH2.classList.add('card-title');
    titleH2.textContent = placeData.name;
    contentDiv.appendChild(titleH2);

    const subtitleP = document.createElement('p');
    subtitleP.classList.add('card-subtitle');
    subtitleP.textContent = placeData.types.join(', ');
    contentDiv.appendChild(subtitleP);

    const ratingDiv = document.createElement('div');
    ratingDiv.classList.add('rating');
    contentDiv.appendChild(ratingDiv);

    const rating = placeData.rating || 0;
    ratingDiv.alt = `${rating}/5.0`;
    for (let i = 0; i < 5; i++) {
        const starIcon = document.createElement('i');
        starIcon.innerHTML = "&#9733;";
        starIcon.classList.add('fas');
        if (i < Math.floor(rating)) {
            starIcon.classList.add('fa-star');
        } else {
            starIcon.classList.add('fa-star-o');
        }
        ratingDiv.appendChild(starIcon);
    }

    const ratingTotal = document.createElement('span');
    ratingTotal.classList.add('in-nums');
    ratingTotal.innerText = `${rating}/5.0`;
    ratingDiv.appendChild(ratingTotal);

    const readMoreLink = document.createElement('a');
    readMoreLink.classList.add('card-link');
    readMoreLink.textContent = 'Abir en Google Maps';
    readMoreLink.href = `https://www.google.com/maps/place/?q=place_id:${placeData.place_id}`;
    readMoreLink.target = '_blank';
    contentDiv.appendChild(readMoreLink);

    recoFeedSection.appendChild(cardDiv);
}

const initializeAll = async (place) => {
    handleVisibility(mainContent, "show", "inline");

    try {
        const places = await getNearbyPlaces(place, 100, "any", "dummy");
        const numCards = places.length;

        for (let i = 0; i < numCards; i++) {
            const place = places[i];
            const photo = await getPlacePhoto(place.photos[0].photo_reference);
            printPlaceCard(place, photo);
        }
    } catch (error) {
        console.error(error);
    }
};


/* Listeners and executions */
document.addEventListener("DOMContentLoaded", handleLocationForm);
locationSelect.addEventListener("change", handleLocationForm);

locationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (locationForm.location.value && locationForm.area.value) {
        handleVisibility(locationModal, "hide");
        initializeAll(locationForm.location.value);
    }
});