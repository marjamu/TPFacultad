window.onload = function(){
    if(localStorage){
        if(localStorage.token){
            validateUser(localStorage.token);
        }
        /*else{
            alert("No tiene permisos suficientes");
            window.location.replace("http://localhost:3000/accessdenied.html");
        }*/
    }

    $("#btnLogIn").click(function(e){;
        login();
    });

};

function validateUser(token){
    xhr = new XMLHttpRequest();
 xhr.onreadystatechange = function() {
     if (this.readyState == 4) {
         if(this.status == 200){
             if(xhr.responseText == "OK"){
                window.location.replace("http://localhost:3000/admin");
             }
         }
         else{
             alert("No tiene permisos suficientes");
             window.location.replace("http://localhost:3000/accessdenied.html");
         }
         
     }
     
 };
 
 xhr.open("POST", "http://localhost:3000/validate", false);
 xhr.setRequestHeader("authorization", token);
 xhr.send("");

}

var xhr;
function login(){
    data = {
        "usuario": document.getElementById("name").value,
        "password": document.getElementById("pass").value
    };
    var senddata= {"collection":"users",
                "data":data};
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4){
            if(this.status == 200){
                localStorage.token = JSON.parse(xhr.responseText).token; 
                window.location.replace(xhr.getResponseHeader('redirect'));
            }
            if(this.status == 403){
                window.location.replace("http://localhost:3000/accessdenied.html");
            }
        } 
        
        
    };
    
    xhr.open("POST", "http://localhost:3000/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(senddata));
}
