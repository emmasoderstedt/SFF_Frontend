var page = document.getElementById("content");
var loggedIn;
if (localStorage.getItem("userId") !== null) 
{
    loggedIn=true;
}

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
    page.innerHTML = "";

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
                
                //checkar matchande användaruppgifter
                for (i = 0; i < json.length; i++) 
                {
                    if (userName == json[i].name && password == json[i].password && json[i].verified == true) {

                        //sparar id och namn i localstorage
                        localStorage.setItem("userId", json[i].id);
                        localStorage.setItem("userName", json[i].name)

                        loggedIn=true;
                    }
                    
                }
                
                //gick inloggningen igenom visa logginpage
                if (loggedIn) 
                {
                    showLoggedinPage();
                    
                } else //annars visa felmeddelande
                {
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
    page.insertAdjacentHTML("beforeend",'<div id="registerFilmstudio" class="registerFilmstudio"><h2>Registrera filmstudio</h2> Namn <input type="text" id="newUsername"> Lösenord <input type="password" id="newPassword"> Email <input type="text" id="newEmail"> <button id="register">Registrera</button></div>');

    var registerButton = document.getElementById("register");

    registerButton.addEventListener('click', function() {
        userName = document.getElementById("newUsername").value;
        password = document.getElementById("newPassword").value;
        email = document.getElementById("newEmail").value;
        console.log("knapp tryckt!")
        postFilmstudio(userName, password, email);
        page.insertAdjacentHTML("beforeend", '<div><p id="registratedStudio">Studion är nu registrerad! Invänta verifiering. Bekräftelse skickas via mail. </p></div>');

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
    page.insertAdjacentHTML("beforeend","<h3> Tillgängliga filmer<h3><div id='filmList'></div>");
    getAllMovies();
}
//------------------------------------------------------------------------------------------------------------------------

//                                   ADMIN PAGE
//------------------------------------------------------------------------------------------------------------------------

function showLoggedinAdminPage() 
{
    page.innerHTML = "";
    
    //hälsar välkommen
    page.insertAdjacentHTML("afterbegin", "Välkommen Admin");

    //logga ut-knapp
    page.insertAdjacentHTML("beforeend", " <div> <button id= 'loggoutAdminButton'>Logga ut</button></div>");
    var loggoutButton = document.getElementById("loggoutAdminButton");

    loggoutButton.addEventListener("click", function () {
        localStorage.removeItem("userId");
        showStartPage();
    })

    //Lista alla filmstudios
    page.insertAdjacentHTML("beforeend", '<div id="listOfFilmstudios"><h3>Filmstudio</h3><ul id="filmstudioList"></ul></div>');

    fetch('https://localhost:5001/api/filmstudio')
    .then(response => response.json())
    .then(function(json) {
        console.log(json);
        var filmstudioList = document.getElementById("filmstudioList");

        for(i =0; i<json.length; i++)
        {
            //skriver ut knapp med studionamn som skickar vidare till filmstudio-sida
            filmstudioList.insertAdjacentHTML("beforeend", "<li><button id='filmstudioButton' onclick='filmstudioPage("+json[i].id+",\""+json[i].name+"\")'>"+json[i].name+"</button></li>");

        }
    })

    //Lista alla filmklubbar som väntar på verifiering
    page.insertAdjacentHTML("beforeend",'<div id="verifyFilmstudio"><h3>Verifiera filmstudio</h3><ul id="studioList"></div>');

    fetch('https://localhost:5001/api/filmstudio')
    .then(response => response.json())
    .then(function(json) {
        console.log(json);
        var listOfStudios = document.getElementById("studioList");
        var numberOfUnverifiedStudios =0;

        for(i =0; i<json.length; i++)
        {
            if(json[i].verified == false)
            {
                numberOfUnverifiedStudios++;
                //skriver ut studionamn med verifieringsknapp
                listOfStudios.insertAdjacentHTML("beforeend", "<li>" + json[i].name + "</li> <button onclick='verifyStudio("+json[i].id+",\""+ json[i].name +"\",\""+ json[i].password +"\")'>Verifiera</button>")
            }
            
        }
        if (numberOfUnverifiedStudios== 0) {
            listOfStudios.insertAdjacentHTML("beforeend", "<p>Det finns inga studios att verifiera</p>");
        }
    })

    //Lägga till ny film
    page.insertAdjacentHTML("beforeend",'<div id="addMovie" class="addMovie"><h2>Lägg till ny film</h2> Filmtitel <input type="text" id="newFilmName"> Stock <input type="text" id="newStock"><button id="add">Lägg till</button></div>');
 
    var addButton = document.getElementById("add");
 
    addButton.addEventListener('click', function() {
        filmName = document.getElementById("newFilmName").value;
        stock = document.getElementById("newStock").value;

        postMovie(filmName, stock);
        page.insertAdjacentHTML("beforeend", '<div><p id="addedFilm"> Filmen är nu tillagd! </p></div>');
 
     });
    

}
//------------------------------------------------------------------------------------------------------------------------

//                                  MOVIE PAGE
//------------------------------------------------------------------------------------------------------------------------

function showMoviePage(movieId, movieName, stock)
{
    page.innerHTML = "";

    //Skriver ut titel och visar placeholder för filmposter
    page.insertAdjacentHTML("beforeend", "<div id= filmPresentation><h2>"+ movieName +"</h2> <img src='filmposter.jpg' alt='posterTemplate' class='filmposter'></div>");
        
       
    //om inloggad
    if(loggedIn)
    {
        //skriv ut gå tillbaka knapp, visar loggedinpage vid knapptryck
        page.insertAdjacentHTML("beforeend","<div> </br><button id='goBackButton' onclick='showLoggedinPage()'> Gå tillbaka </button></div>");
        
        fetch('https://localhost:5001/api/rentedfilm')
        .then(response => response.json())
        .then(function(json) {
            console.log("allRentals", json);
            
            var studioId = localStorage.getItem("userId");

            //antal aktiva hyrningar på denna film
            var numberOfRentals = json.filter(a => a.filmId == movieId && a.returned == false).length;
            
            //Skriver ut hyrknapp om den finns att hyra
            if(numberOfRentals <stock)
            {
                page.insertAdjacentHTML("beforeend", "<button id='rentButton' onclick='rentMovie("+movieId +")'>Hyr</button>");
            }
            else //annars meddelande om att den inte finns i lager
            {
                page.insertAdjacentHTML("beforeend", "Filmen är tyvärr inte tillgänglig att hyra");
            }
            
            //alla aktiva rentals aktuell studio har på aktuell film
            var activeRentals = json.filter(a => a.studioId == studioId && a.filmId == movieId && a.returned == false);

            //om inloggad studio hyrt filmen
            if (activeRentals.length>0)
            {
                //skriv ut lämna tillbaka knapp och lämna tillbaka första i listan
                page.insertAdjacentHTML("beforeend", "<button id='returnButton' onclick='returnMovie("+ activeRentals[0].id + "," + movieId +  "," + studioId +")'>Lämna tillbaka</button>");
            }        
            
            //visar trivia del
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
//------------------------------------------------------------------------------------------------------------------------

//                                  STUDIO PAGE
//------------------------------------------------------------------------------------------------------------------------

function filmstudioPage(studioId, studioName){
    page.innerHTML ="";

    //skriver ut studionamn
    page.insertAdjacentHTML("beforeend", "<div id='listOfRentals'><h2>"+studioName+"</h2> <h3>Hyrda filmer</h3></div>");

    fetch('https://localhost:5001/api/RentedFilm')
    .then(response => response.json())
    .then(function(json){

        var rentalsOfThisStudio= json.filter(a => a.studioId == studioId && a.returned == false);

        //går igenom alla hyrningar av aktuell studio
        for (i= 0; i<rentalsOfThisStudio.length; i++)
        {
            //Skriver ut aktuell filmtitel
            printMovieTitle(rentalsOfThisStudio[i].filmId);   
        }

         //skriv ut gå tillbaka knapp, visa adminpage vid knapptryck
        page.insertAdjacentHTML("beforeend","<div> </br><button id='goBackButton' onclick='showLoggedinAdminPage()'> Gå tillbaka </button></div>");
        
    })
    .catch(err => console.log(err))
}
//------------------------------------------------------------------------------------------------------------------------

//                                  FUNCTIONS
//------------------------------------------------------------------------------------------------------------------------

//för att hämta och skriva ut filmtitel
function printMovieTitle(movieId)
{
    var listOfRentals = document.getElementById("listOfRentals");

    //hämtar aktuell film och skriver ut filmtitel
    fetch('https://localhost:5001/api/film/'+ movieId)
    .then(response => response.json())
    .then(function(json){
        console.log("movies", json)
        
        listOfRentals.insertAdjacentHTML("beforeend", "<li>"+json.name+"</li>")

    })
    .catch(err => console.log(err))
}

//för att verifiera studio
function verifyStudio(studioId, studioName, studioPassword) {

    var data = {Id: studioId, Name: studioName, Password: studioPassword, Verified: true };
    fetch('https://localhost:5001/api/filmstudio/' + studioId, {
        method: "PUT",
        headers: {
            "Content-type":'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(data =>
    {
        console.log('Success:', data);

        //skriver ut medddelande: studio verifieras
        page.innerHTML="";
        page.insertAdjacentHTML("afterbegin", "<div id='isRentedMessage'>Studion verifieras... </div>");
        //kalla på emailservice som skickar iväg mail
        setTimeout(() => { showLoggedinAdminPage(); ; }, 1000);

        
    })
    .catch(err => console.log('Error: ', err))

}

//för att hämta alla filmer och skriva ut i lista
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
           //skriver ut lista med knappar för varje film
            printList.insertAdjacentHTML("beforeend", "<li><button id='movieButton' onclick='showMoviePage("+json[i].id+",\""+ json[i].name +"\"," + json[i].stock +")'>" + json[i].name + "</button></li>") 
        }
    })
    .catch(err => console.log(err))

}

//för skicka in ny trivia, att hämta alla trivias och lista dem
function showTrivias(movieId) 
{
    if(loggedIn)
    {
        //Forumlär för att skicka in ny trivia
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
    
    //listar alla trivias
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
function postFilmstudio(studioName, studioPassword, email) 
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

//lägg till ny film
function postMovie(filmName, stock) {

    var intStock = parseInt(stock);

    var data = {Name: filmName, Stock: intStock};
    fetch('https://localhost:5001/api/film', {
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

    var data = {FilmId: filmid, StudioId: userId, Returned: false};

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
//lämna tillbaka film
function returnMovie(rentedfilmId, filmId, studioId){
    console.log("lämnar tillbaka film", filmId);
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
