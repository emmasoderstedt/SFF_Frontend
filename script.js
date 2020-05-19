console.log(localStorage.getItem("userId"));
var page = document.getElementById("content");

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
                    }
                    
                }
                console.log("här är localstorage: " + localStorage.getItem("userId"));
                if (localStorage.getItem("userId") !== null) 
                {
                    showLoggedinPage();
                    
                } else {
                    //showErrorPage();
                    console.log("användarnamnet finns ej");
                }
                })
                .catch(err => console.log(err))
            }
        });


    //Visa tillgängliga filmer
    page.insertAdjacentHTML("beforeend",'<h2>Tillgängliga filmer</h2><div id="filmList"><button onclick="getAllMovies()" >få alla filmer</button></div>');

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

            print = print + json[localStorage.getItem("userId")].name;
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
    page.insertAdjacentHTML("beforeend",'<h2>Tillgängliga filmer</h2><div id="filmList"><button id="rentButton" onclick="getAllMovies()">Få alla filmer</button></div>');

    //lista av lånade filmer och möjlighet att lämna tillbaka
    page.insertAdjacentHTML("beforeend", '<h2>Dina hyrda filmer</h2><div id="rentedFilmsList"><button id="getRentalsButton" onclick="getListOfRentedMovies()">Mina hyrda filmer</button><div>');
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
    console.log("hämtar lista med hyrda filmer");
    var listOfRentedMovies = document.getElementById("rentedFilmsList");
    listOfRentedMovies.innerHTML ="";

    fetch('https://localhost:5001/api/rentedfilm')
    .then(response => response.json())
    .then(function(json) {
        console.log(json);
        console.log(localStorage.getItem("userId"));

        for(i =0; i<json.length; i++)
        {
            if(json[i].studioid == localStorage.getItem("userId") && json[i].returned == false)
            {
                listOfRentedMovies.insertAdjacentHTML("beforeend", "<li>" + json[i].filmid + "</li> <button id='returnButton' onclick='returnMovie(" + json[i].id +")'>Lämna tillbaka</button>")
            }
        }
    })

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
            console.log(json[i].name)
            
            //om inloggad
            if (localStorage.getItem("userId") !== null) {
                console.log("här är en film som kan hyras");
                printList.insertAdjacentHTML("beforeend", "<li>" + json[i].name + "</li> <button id='rentButton' onclick='rentMovie(" + json[i].id +", 1)'>Hyr</button>")
            } 
            else //om inte inloggad
            {
                console.log("här är en film som inte kan hyras!");
                printList.insertAdjacentHTML("beforeend", "<li>" + json[i].name + "</li>")
            }

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
function rentMovie(filmid, studioid) {
    console.log("renting movie!!", filmid)

    var data = {FilmId: filmid, StudioId: studioid, Returned: false};

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

function returnMovie(rentedfilmId){
    console.log("lämnar tillbaka film", rentedfilmId);
    var data = {Id: rentedfilmId, Returned: true}

    fetch('https://localhost:5001/api/rentedfilm/' + rentedfilmId, {
        method: "PUT",
        headers: {
            "Content-type":'application/json',
        }, 
        body: JSON.stringify(data),
    })
    .then(response = response.json())
    .then(data => {
        console.log('Sucess', data)
    })
    .catch(err => console.log('Error: ', err))

}
