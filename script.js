console.log(localStorage.getItem("userId"));
var page = document.getElementById("content");
var loggedIn;

if (localStorage.getItem("userId") !== null) {
    showLoggedinPage();
} else {
    showStartPage();
}
//------------------------------------------------------------------------------------------------------------------------

//                                   START PAGE
//------------------------------------------------------------------------------------------------------------------------

function showStartPage() 
{
    page.innerHTML = " ";

    //logga in filmklubb
    page.insertAdjacentHTML("afterbegin","<div class='login'><b>Logga in</b> </br> Användarnamn <input type='text' id='userName'> Lösenord <input type='password' id='password'> <button id='login'>Logga in</button></div>");
    var loginButton = document.getElementById("login");

    loginButton.addEventListener('click', function() {
        userName = document.getElementById("userName").value;
        password = document.getElementById("password").value;
        console.log("knapp tryckt!")

         //tillfällig kod för att logga in admin
         if (userName == "admin" && password == "1234")
         {
             showLoggedinAdminPage();
         }
         else  //logga in filmklubb
         {    
            fetch('https://localhost:5001/api/filmstudio')
            .then(response => response.json())
            .then(function (json) {
                console.log(json);
                 
                for (i = 0; i < json.length; i++) 
                {
                    if (userName == json[i].name && password == json[i].password && json[i].verified == true) {

                        console.log("Ja de stämmer!");
                        localStorage.setItem("userId", json[i].id);
                        localStorage.setItem("userName", json[i].name)
                        loggedIn=true;
                    }
                    
                }
                console.log("här är localstorage: " + localStorage.getItem("userId"));
                if (localStorage.getItem("userId") !== null) 
                {
                    showLoggedinPage();
                    
                } else {
                    page.insertAdjacentHTML("afterbegin", "<div> Fel användarnamn eller lösenord. Försök igen </div>");
                }
                })
                .catch(err => console.log(err))
            }
        });


    //Visa tillgängliga filmer
    page.insertAdjacentHTML("beforeend","<h2> Tillgängliga filmer<h2><div id='filmList'></div>");
    getAllMovies();

    //Registrera filmstudio
    page.insertAdjacentHTML("beforeend",'<div id="registerFilmstudio" class="registerFilmstudio"><h2>Registrera filmstudio</h2> Namn <input type="text" id="newUsername"> Lösenord <input type="password" id="newPassword"> <button id="register" onclick="">Registrera</button></div>');
    name = document.getElementById("newUsername").value;
    userName = document.getElementById("newPassword").value;

    var registerButton = document.getElementById("register");

    registerButton.addEventListener('click', function() {
        userName = document.getElementById("newUsername").value;
        password = document.getElementById("newPassword").value;
        console.log("knapp tryckt!")
        postFilmstudio(userName, password);
        page.insertAdjacentHTML("beforeend", '<div><p id="registratedStudio">Studion är nu registrerad!</p></div>');

    });
}

//------------------------------------------------------------------------------------------------------------------------

//                                   LOGGED IN PAGE
//------------------------------------------------------------------------------------------------------------------------

function showLoggedinPage() 
{
    page.innerHTML = "";

    //skriver ut hej och välkommen "filmstudionamn"
    var print = "Hej och välkommen ";
    fetch("https://localhost:5001/api/filmstudio")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
           
            print = print + localStorage.getItem("userName");
            page.insertAdjacentHTML("afterbegin", print);

        })

    //logga ut knapp
    page.insertAdjacentHTML("beforeend", " <div> <button id= 'loggoutButton'>Logga ut</button></div>");
    var loggoutButton = document.getElementById("loggoutButton");

    loggoutButton.addEventListener("click", function () {
        localStorage.removeItem("userId");
        showStartPage();
    })

    //Listar alla filmer och ger möjlighet att hyra
    page.insertAdjacentHTML("beforeend","<h2> Tillgängliga filmer<h2><div id='filmList'></div>");
    getAllMovies();
}




//------------------------------------------------------------------------------------------------------------------------

//                                   ADMIN PAGE
//------------------------------------------------------------------------------------------------------------------------



function showLoggedinAdminPage() 
{
    //tömmer sidan och hälsar välkommen
    page.innerHTML = "";
    page.insertAdjacentHTML("afterbegin", "Välkommen Admin");

    //logga ut-knapp
    page.insertAdjacentHTML("beforeend", " <div> <button id= 'loggoutAdminButton'>Logga ut</button></div>");
    var loggoutButton = document.getElementById("loggoutAdminButton");

    loggoutButton.addEventListener("click", function () {
        localStorage.removeItem("userId");
        showStartPage();
    })

    //Lista alla uthyrningar
    page.insertAdjacentHTML("beforeend",'<h2>Uthyrda filmer</h2><div id="rentList"><button onclick="getAllRentals()" >få alla uthyrningar</button></div>');
    
    //Lista alla filmklubbar som väntar på verifiering
    page.insertAdjacentHTML("beforeend",'<h2>Verifiera filmstudio</h2><div id="studioList"><button onclick="getListOfUnverifiedStudios()" >verifiera studios</button></div>');
    

}

//------------------------------------------------------------------------------------------------------------------------

//                                  FUNCTIONS
//------------------------------------------------------------------------------------------------------------------------


//lista av hyrda filmer för inloggad användare
function getListOfRentedMovies(){
    var rentedfilms;

    console.log("hämtar lista med hyrda filmer");
    var listOfRentedMovies = document.getElementById("rentedFilmsList");
    listOfRentedMovies.innerHTML ="";

    
    
    fetch('https://localhost:5001/api/rentedfilm')
    .then(response => response.json())
    .then(function(json) {
        
        var studioId = localStorage.getItem("userId");
        console.log(json);
        console.log("localstorage" + localStorage.getItem("userId"));
        console.log("studioid: " + studioId);
        rentedfilms = json.filter(a=>a.studioId == studioId && a.returned == false);
        
    })
    
    fetch('https://localhost:5001/api/film')
    .then(response => response.json())
    .then(function(json){
        console.log("printList", json)
        
        for(i =0; i<rentedfilms.length; i++)
        {
            var rentedMovie = rentedfilms[i].filmId;
            for(i =0; i<json.length; i++)
            {
                if (rentedMovie == json[i].id)
                {
                    listOfRentedMovies.insertAdjacentHTML("beforeend", "<li>" + json[i].name + " <button id='returnButton' onclick='returnMovie(" + json[i].id +")'>Lämna tillbaka</button></li>")   
                }

            }
        }
        
    })
    .catch(err => console.log(err))
    

}

function getListOfUnverifiedStudios()
{
    var listOfStudios = document.getElementById("studioList");

    fetch('https://localhost:5001/api/filmstudio')
    .then(response => response.json())
    .then(function(json) {
        console.log(json);
        for(i =0; i<json.length; i++)
        {
            if(!json[i].Verified)
            {
                listOfStudios.insertAdjacentHTML("beforeend", "<li>" + json[i].name + "</li> <button onclick='VerifyStudio("+json[i].id +")'>Verifiera</button>")
            }
        }
    })
}
function VerifyStudio(studioId) {

    var data = {Id: studioId, Name: "Finsta", Password: "1111", Verified: true };
    fetch('https://localhost:5001/api/filmstudio/' + studioId, {
        method: "PUT",
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

function showMoviePage(movieId, movieName)
{
    page.innerHTML = "";

    //Skriver ut titel och visar placeholder för filmposter
    page.insertAdjacentHTML("beforeend", "<div id= filmPresentation><h2>"+ movieName +"</h2> <img src='filmposter.jpg' alt='posterTemplate' class='filmposter'></div>");
        
       
    //om inloggad
    if(loggedIn)
    {
        //skriv ut gå tillbaka knapp, visa loggedinpage vid knapptryck
        page.insertAdjacentHTML("beforeend","<div> </br><button id='goBackButton' onclick='showLoggedinPage()'> Gå tillbaka </button></div>");
        
        //Skriver ut hyrknapp
        page.insertAdjacentHTML("beforeend", "<button id='rentButton' onclick='rentMovie("+movieId+")'>Hyr</button>");
        
        fetch('https://localhost:5001/api/rentedfilm')
        .then(response => response.json())
        .then(function(json) {
            
            var studioId = localStorage.getItem("userId");
            console.log(json);
            var activeRentals = json.filter(a => a.studioId == studioId && a.filmId == movieId && a.returned == false);
            
            //om inloggad studio hyrt filmen 1 gång eller fler
            if (activeRentals.length>0)
            {
                console.log("activeRentals", activeRentals);
                //skriv ut lämna tillbaka knapp och lämna tillbaka första i listan
                page.insertAdjacentHTML("beforeend", "<button id='returnButton' onclick='returnMovie("+ activeRentals[0].id + "," + movieId +  "," + studioId +")'>Lämna tillbaka</button>");
            }        
            
            //visar del med trivias
            showTrivias(movieId);
        })
        
        
    } else //om utloggad
    {
        //skriv ut gå tillbaka knapp, visa startsida vid knapptryck
        page.insertAdjacentHTML("beforeend","<div> </br><button id='goBackButton' onclick='showStartPage()'> Gå tillbaka </button></div>");

        //visar del med trivia
        showTrivias(movieId);
    
    } 
   
}
//get alla rentals på alla filmstudios för admin sida
function getAllRentals()
{
    /*
    var listToPrint = document.getElementById("rentList");
    var rentList = "";
    fetch('https://localhost:5001/api/rentedfilm')
    .then(response => response.json())
    .then(function(json){
        console.log("listToPrint", json);
        for (i = 0; i<json.length; i++)
        {
            if (!json[i].returned)
            {
                fetch('https://localhost:5001/api/film')
                .then(response => response.json())
                .then(function(filmJson){
                    
                })
                listToPrint.insertAdjacentHTML("beforeend", "<li> film: "+ json[i].FilmId + "studio: " + json[i].StudioId  + "</li>")
            }
        }
    })
*/
}

//för att hämta alla movies, skriva ut dom i konsollen och kunna hyra dom.
function getAllMovies() 
{
    var printList = document.getElementById("filmList");

    fetch('https://localhost:5001/api/film')
    .then(response => response.json())
    .then(function(json){
        printList.innerHTML = "";
        console.log("printList", json)
        
        for (i =0; i<json.length; i++)
        {

                printList.insertAdjacentHTML("beforeend", "<li><button id='movieButton' onclick='showMoviePage("+json[i].id+",\""+ json[i].name +"\")'>" + json[i].name + "</button></li>") 

        }
    })
    .catch(err => console.log(err))

}

//för att hämta alla trivias och skriva ut i konsollen
function showTrivias(movieId) 
{
    if(loggedIn)
    {
        page.insertAdjacentHTML("beforeend",'<div id="triviaDiv"></br><h3>Skicka in ny trivia</h3><textarea id="newTrivia" name="message" rows="10" cols="30"></textarea></br><button id="sendButton">Skicka trivia</button></div>');
        var sendButton = document.getElementById("sendButton");

        sendButton.addEventListener('click', function() {
            
            newTrivia = document.getElementById("newTrivia").value;

            var data = {FilmId: movieId, Trivia: newTrivia};
            fetch('https://localhost:5001/api/filmtrivia', {
                method: "POST",
                headers: {
                    "Content-type":'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Sucess', data)
                    var triviaDiv = document.getElementById("triviaDiv");
                    triviaDiv.insertAdjacentHTML("beforeend", "</br>Trivia skickad!");
                    
                })
                .catch(err => console.log('Error: ', err))
        })


    }
    
    fetch('https://localhost:5001/api/filmTrivia')
    .then(response => response.json())
    .then(function(json){
        console.log("allTrivias", json)
        page.insertAdjacentHTML("beforeend", "<h3>Alla trivias</h3>");
        var currentMovieTrivias = json.filter(a => a.filmId == movieId);
        
        for (i=0; i<currentMovieTrivias.length; i++)
        {
            page.insertAdjacentHTML("beforeend", "<div i='trivias'><p> "+currentMovieTrivias[i].trivia +"</p></div>");
        }
        
    })
    .catch(err => console.log(err))

}
//lägg till ny filmstudio
function postFilmstudio(studioName, studioPassword) 
{
    var data = {Name: studioName, Password: studioPassword, Verified: false};
    fetch('https://localhost:5001/api/filmstudio', {
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

//hyr film
function rentMovie(filmid) {
    console.log("renting movie!!", filmid)
    var userId = parseInt(localStorage.getItem("userId"));

    var data = {FilmId: filmid, StudioId: userId};

    fetch('https://localhost:5001/api/RentedFilm', {
        method: "POST",
        headers: {
            "Content-type":'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Sucess', data)
        page.innerHTML="";
        page.insertAdjacentHTML("afterbegin", "<div id='isRentedMessage'>Filmen hyrs! HOLD ON! </div>");
        setTimeout(() => { showLoggedinPage(); ; }, 1000);

    })
    .catch(err => console.log('Error: ', err))


}

function returnMovie(rentedfilmId, filmId, studioId){
    console.log("lämnar tillbaka film");
    var data = {Id: rentedfilmId, FilmId: filmId, StudioId: studioId, Returned: true}

    fetch('https://localhost:5001/api/rentedfilm/' + rentedfilmId, {
        method: "PUT",
        headers: {
            "Content-type":'application/json',
        }, 
        body: JSON.stringify(data),
    })
    .then(data => {
        console.log('Sucess', data)
        page.innerHTML="";
        page.insertAdjacentHTML("afterbegin", "<div id='isRentedMessage'>Filmen lämnas tillbaka! HOLD ON! </div>");
        setTimeout(() => { showLoggedinPage(); ; }, 1000);
    })
    .catch(err => console.log('Error: ', err))

}
