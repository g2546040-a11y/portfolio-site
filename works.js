fetch("works.csv")
    .then(response => response.text())
    .then(data => {
        var rows = data.trim().split("\n");
        var headers = rows[0].split(",");

        var works = rows.slice(1).map(row => {
            var values = row.split(",");
            var work = {};
            headers.forEach((header, index) => {
                work[header] = values[index];
            });

            work.images = work.image.split("|");

            var firstDate = work.description.split("-")[0];
            var parts = firstDate.split("/");
            work.year = Number(parts[0]);
            work.month = Number(parts[1]);

            return work;
        });

        var grid = document.getElementById("works-grid");
        var categorySelect = document.getElementById("category");
        var sortSelect = document.getElementById("sort");

        var categories = ["2026", "2025"];
        works.forEach(work => {
            if (work.category && !categories.includes(work.category)) {
                categories.push(work.category);
            }
        });

        categories.forEach(category => {
            var option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        function displayWorks() {
            var SelectedCategory = categorySelect.value;
            var sortType = sortSelect.value;

            var filteredWorks = works.slice();

            if (SelectedCategory !== "all") {

                // 年フィルタ（2025 / 2026）
                if (SelectedCategory === "2025" || SelectedCategory === "2026") {
                    filteredWorks = filteredWorks.filter(work => String(work.year) === SelectedCategory);
                }

                // カテゴリフィルタ
                else {
                    filteredWorks = filteredWorks.filter(work => work.category === SelectedCategory);
                }
            }


            if (sortType === "new") {
                filteredWorks.sort((a, b) => b.year - a.year || b.month - a.month);
            } else if (sortType === "old") {
                filteredWorks.sort((a, b) => a.year - b.year || a.month - b.month);
            } else if (sortType === "title") {
                filteredWorks.sort((a, b) => a.title.localeCompare(b.title, "ja"));
            }

            grid.innerHTML = "";

            filteredWorks.forEach(work => {
                var card = document.createElement("article");
                card.className = "work-card";

                card.innerHTML =
                    '<div class="slider">' +
                    '<button class="slider-btn prev">◀</button>' +
                    '<img class="slider-main" src="' + work.images[0] + '">' +
                    '<button class="slider-btn next">▶</button>' +
                    '</div>' +
                    '<div class="work-info">' +
                    '<p class="work-category">' + (work.category || "") + '</p>' +
                    '<h4>' + work.title + '</h4>' +
                    '<p>' + work.description + '</p>' +
                    '<p class="work-year">' + work.year + '</p>' +
                    '</div>';

                var currentIndex = 0;
                var mainImg = card.querySelector(".slider-main");
                var prevBtn = card.querySelector(".prev");
                var nextBtn = card.querySelector(".next");

                prevBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    currentIndex = (currentIndex - 1 + work.images.length) % work.images.length;
                    mainImg.src = work.images[currentIndex];
                });

                nextBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    currentIndex = (currentIndex + 1) % work.images.length;
                    mainImg.src = work.images[currentIndex];
                });

                card.addEventListener("click", function (e) {
                    e.stopPropagation();
                    card.classList.add("expanded");
                    document.getElementById("overlay").style.display = "block";
                });

                grid.appendChild(card);
            });
        }

        displayWorks();

        document.getElementById("overlay").addEventListener("click", function () {
            document.querySelectorAll(".work-card.expanded").forEach(card => {
                card.classList.remove("expanded");
            });
            this.style.display = "none";
        });

        categorySelect.addEventListener("change", displayWorks);
        sortSelect.addEventListener("change", displayWorks);

        var latitude = 35.5619964;
        var longitude = 139.5743009;

        var weatherUrl =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + latitude +
            "&longitude=" + longitude +
            "&current=temperature_2m,weather_code" +
            "&timezone=Asia/Tokyo";

        fetch(weatherUrl)
            .then(response => response.json())
            .then(data => {
                var weatherCode = data.current.weather_code;
                var temp = data.current.temperature_2m;
                showWeather(weatherCode, temp);
            });

        function showWeather(code, temp) {
            var icon = document.getElementById("weather-icon");

            if (code === 0) icon.textContent = "☀";
            else if (code >= 1 && code <= 3) icon.textContent = "☁";
            else if (code >= 51 && code <= 67) icon.textContent = "🌧";
            else if (code >= 71 && code <= 86) icon.textContent = "❄";
            else if (code >= 95 && code <= 99) icon.textContent = "⛈";
            else icon.textContent = "⛅";

            var tempBox = document.createElement("p");
            tempBox.textContent = "気温：" + temp + "℃";
            tempBox.style.fontSize = "16px";
            tempBox.style.marginTop = "4px";
            tempBox.style.opacity = "0.8";
            tempBox.style.fontWeight = "300";

            icon.insertAdjacentElement("afterend", tempBox);
        }

    });



