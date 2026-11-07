
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");

const loginOpen = document.getElementById("loginOpen");
const signupOpen = document.getElementById("signupOpen");
const logoutBtn = document.getElementById("logoutBtn");

function openModal(modal) {
    modal.classList.add("show");
}

function closeModal(modal) {
    modal.classList.remove("show");
}

loginOpen.addEventListener("click", () => openModal(loginModal));
signupOpen.addEventListener("click", () => openModal(signupModal));

document.querySelectorAll(".close").forEach(button => {
    button.addEventListener("click", () => {
        closeModal(document.getElementById(button.dataset.close));
    });
});

document.getElementById("switchSignup").addEventListener("click", event => {
    event.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
});

document.getElementById("switchLogin").addEventListener("click", event => {
    event.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
});

// Demo registration and login using this browser's local storage.
// This is not secure production authentication.
function getAccounts() {
    return JSON.parse(localStorage.getItem("wildoraAccounts") || "[]");
}

function saveSession(account) {
    localStorage.setItem("wildoraSession", JSON.stringify(account));
    updateUserInterface();
}

document.getElementById("signupForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;

    const accounts = getAccounts();

    if (accounts.some(account => account.email === email)) {
        alert("This email is already registered. Please log in.");
        return;
    }

    const account = { name, email, password, favorites: [] };
    accounts.push(account);
    localStorage.setItem("wildoraAccounts", JSON.stringify(accounts));

    saveSession({ name, email });
    event.target.reset();
    closeModal(signupModal);
    alert("Account created! Welcome to WILDORA.");
});

document.getElementById("loginForm").addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const account = getAccounts().find(user =>
        user.email === email && user.password === password
    );

    if (!account) {
        alert("Incorrect email or password.");
        return;
    }

    saveSession({ name: account.name, email: account.email });
    event.target.reset();
    closeModal(loginModal);
    alert("Login successful. Welcome back!");
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("wildoraSession");
    updateUserInterface();
    alert("You have logged out.");
});

function updateUserInterface() {
    const session = JSON.parse(localStorage.getItem("wildoraSession") || "null");

    loginOpen.classList.toggle("hidden", !!session);
    signupOpen.classList.toggle("hidden", !!session);
    logoutBtn.classList.toggle("hidden", !session);

    const accountSection = document.getElementById("accountSection");
    accountSection.classList.toggle("hidden", !session);

    if (session) {
        document.getElementById("userName").textContent = session.name;
        showFavorites(session.email);
    }
}

// Animal category filters
const filterButtons = document.querySelectorAll(".filter");
const animalCards = document.querySelectorAll(".animal-card");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");

        const category = button.dataset.filter;

        animalCards.forEach(card => {
            card.style.display =
                category === "all" || card.dataset.category === category
                    ? "block"
                    : "none";
        });
    });
});

// Favorites
function getFavoriteAnimals(email) {
    const accounts = getAccounts();
    const account = accounts.find(user => user.email === email);
    return account ? account.favorites || [] : [];
}

function showFavorites(email) {
    const favorites = getFavoriteAnimals(email);
    const list = document.getElementById("favoriteList");

    list.textContent = favorites.length
        ? favorites.join(", ")
        : "No favorites yet. Explore animals and add one!";
}

document.querySelectorAll(".favorite-btn").forEach(button => {
    button.addEventListener("click", () => {
        const session = JSON.parse(localStorage.getItem("wildoraSession") || "null");

        if (!session) {
            alert("Please log in first to save your favorite animals.");
            openModal(loginModal);
            return;
        }

        const card = button.closest(".animal-card");
        const animalName = card.querySelector("h3").textContent;

        const accounts = getAccounts();
        const account = accounts.find(user => user.email === session.email);

        if (!account) return;

        account.favorites = account.favorites || [];

        if (account.favorites.includes(animalName)) {
            account.favorites = account.favorites.filter(name => name !== animalName);
            button.textContent = "♡ Add to Favorites";
            button.classList.remove("saved");
        } else {
            account.favorites.push(animalName);
            button.textContent = "♥ Saved";
            button.classList.add("saved");
        }

        localStorage.setItem("wildoraAccounts", JSON.stringify(accounts));
        showFavorites(session.email);
    });
});

// Restore login when the page is opened again
updateUserInterface();
