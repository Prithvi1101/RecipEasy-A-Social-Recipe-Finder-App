document.addEventListener("DOMContentLoaded", () => {
  const result = document.getElementById("result");
  const searchBtn = document.getElementById("search-btn");
  const overlay = document.getElementById("overlay");
  const recipePanel = document.getElementById("recipe-panel");
  const favoritesList = document.getElementById("favorites-list");
  const searchHistoryDiv = document.getElementById("search-history");
  const clearHistoryBtn = document.getElementById("clear-history-btn");
  const searchInput = document.getElementById("user-inp");

  const urlSearch = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
  const urlLookup = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
  const urlFilterIngredient = "https://www.themealdb.com/api/json/v1/1/filter.php?i=";
  const urlRandom = "https://www.themealdb.com/api/json/v1/1/random.php";
  const urlSearchByLetter = "https://www.themealdb.com/api/json/v1/1/search.php?f=";

  // Load search history and render clickable terms
  function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    if (history.length === 0) {
      searchHistoryDiv.innerHTML = "<em>No recent searches.</em>";
      clearHistoryBtn.disabled = true;
      return;
    }
    clearHistoryBtn.disabled = false;
    searchHistoryDiv.innerHTML = history
      .map(term => `<span>${term}</span>`)
      .join("");
    Array.from(searchHistoryDiv.querySelectorAll("span")).forEach(el => {
      el.addEventListener("click", () => {
        searchInput.value = el.textContent;
        searchBtn.click();
      });
    });
  }

  // Add term to search history (limit 10, no duplicates)
  function addSearchHistory(term) {
    if (!term) return;
    let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    history = history.filter(h => h.toLowerCase() !== term.toLowerCase());
    history.unshift(term);
    if (history.length > 10) history.pop();
    localStorage.setItem("searchHistory", JSON.stringify(history));
    loadSearchHistory();
  }

  clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("searchHistory");
    loadSearchHistory();
  });

  // Load favorites list and render
  async function loadFavorites() {
    favoritesList.innerHTML = "";
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (favorites.length === 0) {
      favoritesList.innerHTML = "<li>No favorite dishes yet.</li>";
      return;
    }
    for (const id of favorites) {
      const meal = await loadFullRecipe(id);
      if (meal) {
        const li = document.createElement("li");
        const nameSpan = document.createElement("span");
        nameSpan.textContent = meal.strMeal;
        nameSpan.classList.add("favorited");
        nameSpan.style.cursor = "pointer";
        nameSpan.onclick = () => {
          searchInput.value = meal.strMeal;
          searchBtn.click();
        };

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          removeFavorite(id);
        };

        li.appendChild(nameSpan);
        li.appendChild(removeBtn);
        favoritesList.appendChild(li);
      }
    }
  }

  // Add favorite and cache recipe for offline use
  async function addFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      try {
        const res = await fetch(urlLookup + id);
        const data = await res.json();
        if (data.meals) {
          localStorage.setItem(`recipe_${id}`, JSON.stringify(data.meals[0]));
        }
      } catch (e) {
        console.error("Failed to cache recipe", e);
      }
      loadFavorites();
    }
  }

  // Remove favorite and cached recipe
  function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    favorites = favorites.filter(favId => favId !== id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    localStorage.removeItem(`recipe_${id}`);
    loadFavorites();
    const favBtn = document.getElementById("fav-btn");
    if (favBtn && favBtn.dataset.mealid === id) {
      favBtn.classList.remove("favorited");
    }
  }

  // Load full recipe from cache or fetch
  async function loadFullRecipe(id) {
    const cached = localStorage.getItem(`recipe_${id}`);
    if (cached) {
      return JSON.parse(cached);
    } else {
      try {
        const res = await fetch(urlLookup + id);
        const data = await res.json();
        if (data.meals) {
          localStorage.setItem(`recipe_${id}`, JSON.stringify(data.meals[0]));
          return data.meals[0];
        }
      } catch (e) {
        console.error("Failed to fetch recipe", e);
      }
      return null;
    }
  }

  // Show recipe in sliding panel with overlay
  function showRecipe(mealId) {
    fetch(urlLookup + mealId)
      .then(res => res.json())
      .then(data => {
        const meal = data.meals[0];
        const ytHTML = meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="yt-link">Watch on YouTube</a>` : '';

        recipePanel.innerHTML = ` 
          <button id="hide-recipe">✕</button>
          <h2>${meal.strMeal}</h2>
          <pre id="instructions">${meal.strInstructions}</pre>
          ${ytHTML}
        `;
        
        // Show overlay and recipe panel
        overlay.style.display = "block";
        recipePanel.style.display = "block";

        // Close panel on "X" or overlay click
        function closePanel() {
          recipePanel.style.display = "none";
          overlay.style.display = "none";
        }
        document.getElementById("hide-recipe").onclick = closePanel;
        overlay.onclick = closePanel;

        const ytLink = document.getElementById("yt-link");
        if (ytLink) {
          ytLink.onclick = function () {
            closePanel();
          };
        }
      })
      .catch(error => {
        console.error("Error fetching recipe:", error);
      });
  }

  // Search button click handler to fetch multiple results
  searchBtn.addEventListener("click", async () => {
    const userInp = searchInput.value.trim();
    if (!userInp) {
      result.innerHTML = "<h3>Input Field Cannot Be Empty</h3>";
      return;
    }

    addSearchHistory(userInp);

    try {
      const res = await fetch(urlSearch + userInp);
      const data = await res.json();

      if (!data.meals) {
        result.innerHTML = "<h3>No Recipe Found</h3>";
        return;
      }

      // Clear previous results
      result.innerHTML = "";

      // Loop through the array of meals and display each one
      data.meals.forEach(meal => {
        const mealDiv = document.createElement("div");
        mealDiv.classList.add("meal-item");

        // Create HTML structure for each meal
        mealDiv.innerHTML = `
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
          <h4>${meal.strMeal}</h4>
          <p>${meal.strArea}</p>
          <button class="view-recipe-btn" data-meal-id="${meal.idMeal}">View Recipe</button>
          <button class="fav-btn" data-mealid="${meal.idMeal}">❤️ Favorite</button>
        `;

        // Append the meal to the results container
        result.appendChild(mealDiv);

        // Add event listener to the "View Recipe" button
        const viewRecipeBtn = mealDiv.querySelector(".view-recipe-btn");
        viewRecipeBtn.addEventListener("click", function() {
          showRecipe(meal.idMeal);
        });

        // Add functionality to the "Favorite" button
        const favBtn = mealDiv.querySelector(".fav-btn");
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        if (favorites.includes(meal.idMeal)) {
          favBtn.classList.add("favorited");
        }
        favBtn.addEventListener("click", async () => {
          if (favBtn.classList.contains("favorited")) {
            favBtn.classList.remove("favorited");
            removeFavorite(meal.idMeal);
          } else {
            favBtn.classList.add("favorited");
            addFavorite(meal.idMeal);
          }
        });
      });
    } catch {
      result.innerHTML = "<h3>Invalid Input</h3>";
    }
  });

  // Search by first letter
  document.getElementById("letter-btn").addEventListener("click", async () => {
    const letter = document.getElementById("letter-input").value.trim();
    if (!letter) {
      result.innerHTML = "<h3>Please enter a letter</h3>";
      return;
    }

    const res = await fetch(urlSearchByLetter + letter);
    const data = await res.json();
    displayMeals(data.meals);
  });

  // Search by ingredient
  document.getElementById("ingredient-btn").addEventListener("click", async () => {
    const ingredient = document.getElementById("ingredient-input").value.trim();
    if (!ingredient) {
      result.innerHTML = "<h3>Please enter an ingredient</h3>";
      return;
    }

    const res = await fetch(urlFilterIngredient + ingredient);
    const data = await res.json();
    displayMeals(data.meals);
  });

  // Get a random meal
  document.getElementById("random-btn").addEventListener("click", async () => {
    const res = await fetch(urlRandom);
    const data = await res.json();
    displayMeals([data.meals[0]]);
  });

  // Function to display meals
  function displayMeals(meals) {
    result.innerHTML = meals.map(meal => `
      <div class="meal-item">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
        <h4>${meal.strMeal}</h4>
        <p>${meal.strArea}</p>
        <button class="view-recipe-btn" data-meal-id="${meal.idMeal}">View Recipe</button>
        <button class="fav-btn" data-mealid="${meal.idMeal}">❤️ Favorite</button>
      </div>
    `).join('');

    // Add event listener to the "View Recipe" button
    document.querySelectorAll('.view-recipe-btn').forEach(btn => {
      btn.addEventListener("click", function() {
        showRecipe(btn.getAttribute("data-meal-id"));
      });
    });

    // Add functionality to the "Favorite" button
    document.querySelectorAll('.fav-btn').forEach(btn => {
      const mealId = btn.getAttribute("data-mealid");
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      if (favorites.includes(mealId)) {
        btn.classList.add("favorited");
      }

      btn.addEventListener("click", () => {
        if (btn.classList.contains("favorited")) {
          btn.classList.remove("favorited");
          removeFavorite(mealId);
        } else {
          btn.classList.add("favorited");
          addFavorite(mealId);
        }
      });
    });
  }

  // Initialize
  loadSearchHistory();
  loadFavorites();
});
