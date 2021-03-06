function userInformationHTML(user) {
    return `
        <h2>${user.name}
            <span class="small-name">
                (@<a href="${user.html_url}" target="_blank">${user.login}</a>)
            </span>
        </h2>

        <div class="gh-content">
            <div class="gh-avatar">
                <a href="${user.html_url}" target="_blank">
                    <img src="${user.avatar_url}" width="80" height="80" alt="${user.login}"/>
                </a>
            </div>
            <p>Followers: ${user.followers} - Following ${user.following} <br> Repos: ${user.public_repos}</p>
        </div>`;
}

// Display repo data on the screen repoData

function repoInformationHTML(repos) {
    if (repos.length == 0) {
        return `<div class="clearfix repo-list">No repost!</div>`;
    }

    // Map returns an array with the results of this function

    var listItemsHTML = repos.map(function(repo) {
        return `<li>
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                </li>`;
    });

//pending resolve the bug that if there's no text in the box, it displays the repositories for the last user that was in there

    return `<div class="clearfix repo-list">
                <p>
                    <strong>Repo List:</strong>
                </p>
                <ul>
                    ${listItemsHTML.join("\n")}
                </ul>
            </div>`;
}

function fetchGitHubInformation(event) {

  /* Bug: When we want to get rid of is the issue with our gh-repo-data
     div not being cleared when there's an empty text box */

     $("gh-user-data").html("");
     $("gh-repo-data").html("");

    var username = $("#gh-username").val();

    if (!username) {
        $("#gh-user-data").html(`<h2>Please enter a GitHub username</h2>`);
        return;
    }

    // display a loader that is an animated gif file that will just keep
    // repeating itself while data has been accessed.

    $("#gh-user-data").html(
        `<div id="loader">
            <img src="assets/css/loader.gif" alt="loading..."/>
        </div>`);

    $.when(
        // Este codigo provoca que se active CORS error
        // $.getJSON(`https://api.github.com/users/${username}`),
        // $.getJSON(`https://api.github.com/users/${username}/repos`)

        // Error corregido consultando: https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9

        $.getJSON(`https://cors-anywhere.herokuapp.com/https://api.github.com/users/${username}`),
    
        // List the repositories for that individual user
        $.getJSON(`https://cors-anywhere.herokuapp.com/https://api.github.com/users/${username}/repos`)

    ).then(
        function(firstResponse, secondResponse) {

            // When we do two calls like this, the when() method packs a response up into arrays
            // So we need to put the indexes in there for these responses

            var userData = firstResponse[0];
            var repoData = secondResponse[0];

            $("#gh-user-data").html(userInformationHTML(userData));
            $("#gh-repo-data").html(repoInformationHTML(repoData));

        },
        function(errorResponse) {
            if (errorResponse.status === 404) {
                $("#gh-user-data").html(
                    `<h2>No info found for user ${username}</h2>`);

            // Error 403 (means forbidden): "API rate limit exceeded..."
            // This is called "throttling", and it's designed to preven
            // users from making too many API requests and putting GitHub
            // servers under stress.

            } else if (errorResponse.status === 403) {
                
                // The date that we want to retrieve is actually stored
                // inside our errorResponse inside the headers, particularly
                // X-RateLimit-Reset header. This is the header that's 
                // provide by GitHub to helpfully let us know whn our quota
                // will be reset and when we can start using the API again.
                // We need to multiply it by 1000 and then turn it into a date object.
                // We're going to use the toLocalTimeString() and pick up your
                // location from your browser and print the local time.
                
                var resetTime = new Date(errorResponse.getRespnseHeader('X-RateLimit-Reset')*1000);
                $("#gh-user-data").html(`<h4>Too many request, please wait until ${resetTime.toLocaleTimeString()}</h4>`);
            } else {
                console.log(errorResponse);
                    $("#gh-user-data").html(
                    `<h2>Error: ${errorResponse.responseJSON.message}</h2>`);
            }
        }
    );
}

$(document).ready(fetchGitHubInformation);
