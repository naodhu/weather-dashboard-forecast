var apiKey = "1b18ce13c84e21faafb19c931bb29331";
var savedSearches = [];


var historyList = function(cityName) {
    $('.past-search:contains("' + cityName + '")').remove();

    
    var searchedHistoryEntry = $("<p>");
    searchedHistoryEntry.addClass("past-search");
    searchedHistoryEntry.text(cityName);

    var SearchContainer = $("<div>");
    SearchContainer.addClass("past-search-container");

    SearchContainer.append(searchedHistoryEntry);

    var searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(SearchContainer);

    if (savedSearches.length > 0){
        var beforeSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(beforeSearches);
    }

    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

    $("#search-input").val("");

};


var loadHistory = function() {
    var savedHistory = localStorage.getItem("savedSearches");

    if (!savedHistory) {
        return false;
    }

    savedHistory = JSON.parse(savedHistory);

    for (var i = 0; i < savedHistory.length; i++) {
        historyList(savedHistory[i]);
    }
};

var weatherSection = function(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                .then(function(response) {
                    return response.json();
                })
                .then(function(response){
                    historyList(cityName);

                    var weatherContainer = $("#current-weather-container");
                    weatherContainer.addClass("current-weather-container");

                    var currentTitle = $("#current-title");
                    var currentDay = moment().format("M/D/YYYY");
                    currentTitle.text(`${cityName} (${currentDay})`);
                    var currentIcon = $("#current-weather-icon");
                    currentIcon.addClass("current-weather-icon");
                    var currentIconCode = response.current.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

                    var presentTemprerature = $("#current-temperature");
                    presentTemprerature.text("Temperature: " + response.current.temp + " \u00B0F");

                    var presentHumidity = $("#current-humidity");
                    presentHumidity.text("Humidity: " + response.current.humidity + "%");

                    var presentWindSpeed = $("#current-wind-speed");
                    presentWindSpeed.text("Wind Speed: " + response.current.wind_speed + " MPH");

                    var presentUvIndex = $("#current-uv-index");
                    presentUvIndex.text("UV Index: ");
                    var presentNumber = $("#current-number");
                    presentNumber.text(response.current.uvi);

                    
                    if (response.present.uvi <= 2) {
                        presentNumber.addClass("favorable");
                    } else if (response.present.uvi >= 3 && response.present.uvi <= 7) {
                        presentNumber.addClass("moderate");
                    } else {
                        presentNumber.addClass("severe");
                    }
                })
        })
        .catch(function(err) {
            $("#search-input").val("");

            alert("We could not find the city you searched for. Try searching for a valid city.");
        });
};

var fiveDayForecastSection = function(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {

            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                // get response from one call api and turn it into objects
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    console.log(response);

                    var futureForecastTitle = $("#future-forecast-title");
                    futureForecastTitle.text("5-Day Forecast:")

                    for (var i = 1; i <= 5; i++) {
                        var futureCard = $(".future-card");
                        futureCard.addClass("future-card-details");

                        var futureDate = $("#future-date-" + i);
                        date = moment().add(i, "d").format("M/D/YYYY");
                        futureDate.text(date);

                        var futureIcon = $("#future-icon-" + i);
                        futureIcon.addClass("future-icon");
                        var futureIconCode = response.daily[i].weather[0].icon;
                        futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

                        var futureTemp = $("#future-temp-" + i);
                        futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

                        var futureHumidity = $("#future-humidity-" + i);
                        futureHumidity.text("Humidity: " + response.daily[i].humidity + "%");
                    }
                })
        })
};

$("#search-form").on("submit", function() {
    event.preventDefault();
    
    var cityName = $("#search-input").val();

    if (cityName === "" || cityName == null) {
        alert("Please enter name of city.");
        event.preventDefault();
    } else {
        // if cityName is valid, add it to search history list and display its weather conditions
        weatherSection(cityName);
        fiveDayForecastSection(cityName);
    }
});

$("#search-history-container").on("click", "p", function() {
    // get text (city name) of entry and pass it as a parameter to display weather conditions
    var previousCityName = $(this).text();
    weatherSection(previousCityName);
    fiveDayForecastSection(previousCityName);

    //
    var previousCityClicked = $(this);
    previousCityClicked.remove();
});

loadHistory();
