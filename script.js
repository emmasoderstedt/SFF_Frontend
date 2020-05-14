var printList = document.getElementById("filmList");
var loginButton = document.getElementById("login");

loginButton.addEventListener('click', function() {
    userName = document.getElementById("userName").value;
    password = document.getElementById("password").value;

    //gör saker som ska hända när man loggar in
});

//för att hämta alla movies, skriva ut dom i konsollen och kunna hyra dom.
function getAllMovies() 
{
    fetch('https://localhost:5001/api/film')
        .then(response => response.json())
        .then(function(json){
            console.log("printList", json)

            printList.innerHTML = "";
            for (i =0; i<json.length; i++)
            {
                console.log(json[i].name)
                printList.insertAdjacentHTML("beforeend", "<li>" + json[i].name + "</li> <button onclick='rentMovie(" + json[i].id +", 1, false)'>Hyr</button>")
            }
        })
        .catch(err => console.log(err))


}
//för att hämta alla trivias och skriva ut i konsollen
function getAllTrivias() 
{
    fetch('https://localhost:5001/api/filmTrivia')
        .then(response => response.json())
        .then(json => console.log(json))
        .catch(err => console.log(err))

}
function postFilmstudio() 
{
    fetch('https://localhost:5001/api/filmstudio')
        .then(response => response.json())
        .then(json => console.log(json))
        .catch(err => console.log(err))

}

function rentMovie(filmid, studioid, returned) {
    console.log("renting movie!!", filmid)

    var data = {FilmId: filmid, StudioId: studioid, Returned: returned};

    fetch('https://localhost:5001/api/rentedfilm', {
        method: "POST",
        headers: {
            "Content-type":'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Sucess', data)
    })
    .catch(err => console.log('Error: ', err))


}