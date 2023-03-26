/* Elements and identifiers */
const form = document.getElementById("location-form");
const locationModal = document.querySelector("#welcomeModal");


/* DOM Handlers */
function elementVisibility(e, shouldHide) {
    if (shouldHide === true) {
        e.classList.add("d-none");
        e.classList.remove("d-inline");
    } else if (shouldHide === false) {
        e.classList.remove("d-none");
        e.classList.add("d-inline");
    }
}


/* Listeners and executions */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    elementVisibility(locationModal, true);
});