const apiKey = "YMsdOcuB5RJao9v3JndFOxwOwAsx0xykZLHnng5Q";

/**
 * Format the query parameters 
 * @param {params} parameters passed 
 */
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

/**
 * Call the NPS API to list the parks for specified states
 * @param {states} names of the states
 * @param {maxResults} max number of results to limit. Default value is 10.
 */
function getParks(states, maxResults=10) {
    const endpointURL = "https://developer.nps.gov/api/v1/parks";
    
    //to additionally get the addresses of the parks
    const fieldVal = "addresses";

    const params = {
        api_key: apiKey,
        stateCode: states,
        fields: fieldVal,
        limit: maxResults
    };

    /*
    const options = {
        headers: new Headers({"X-Api-Key": apiKey})
    };*/

    const queryString = formatQueryParams(params)
    const url = endpointURL + '?' + queryString;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } 
            throw new Error(response.statusText);
        })
        .then(responseJson=>updateDOM(responseJson))
        .catch(err => {
            $('.js-error-message').text(`Oops! Something went wrong: ${err.message}`);
    });
}

/**
 * Get the park physical address from the park details JSON
 * @param {parkDetailsJSON} Park details as JSON 
 */
function getParkAddress(parkDetailsJSON) {
    let addStr= "";
    for(let addr of parkDetailsJSON.addresses) {
        if (addr.type==="Physical") {
            addStr = `${addr.line1}, `;
            addr.line2!==""? addStr+=`${addr.line2}, ` : "";
            addr.line3!==""? addStr+=`${addr.line3}, ` : "";
            addStr += `${addr.city}, ${addr.stateCode} ${addr.postalCode}`;
        }
    }
    return addStr;
}

/**
 * Update the DOM
 * @param {responseJson} response from api as JSON 
 */
function updateDOM(responseJson) {
    for (let i = 0; i < responseJson.data.length ; i++){
        const parkAddress = getParkAddress(responseJson.data[i]);
        $('.nps-results').append(`
            <h3 class="park-name">${responseJson.data[i].fullName}</h3>
            <p class="park-desc">${responseJson.data[i].description}</p>
            <p class="park-link">
                <a href=${responseJson.data[i].url} 
                alt="Link to ${responseJson.data[i].fullName}"> Link to the website </a>
            </p>
            <p class="park-loc">Park Office Location: ${parkAddress}</p>
        `);
    }
}

/**
 * Add a listener for form submission
 */
function addSubmitListener() {
    $("form").submit(event=> {
        event.preventDefault();
        let states = $("#states").val();
        let maxResults = $("#max-results").val();
        $(".js-error-message").empty();
        $(".nps-results").empty();
        getParks(states,maxResults);
    });
}

/**
 * Add listener to select option changes and reflect the changes as text.
 */
function addSelectChangeListener() {
    $("select").change(function () {
        let statestr = "";
        $("select option:selected").each(function() {
        statestr += $(this).text() + " ";
        });
        $(".sel-state").text( statestr );
        $(".js-error-message").empty();
        $(".nps-results").empty(); 
    })
    .change();

}


$(function(){
    addSelectChangeListener();
    addSubmitListener();
});