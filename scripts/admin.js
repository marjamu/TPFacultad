var xhr;
var datos = new Array();
var postAModificar;

//lo primero que hago es preguntar si hay localStorage.
if(localStorage){
    if(localStorage.token){
        //envio una peticion para ver si el token es valido
        validateUser(localStorage.token);
    }
    else{
        //si quieren acceder directamente a "admin" sin permisos, se redirecciona a accessdenied
        alert("No tiene permisos suficientes");
        window.location.replace("http://localhost:3000/accessdenied.html");
    }
}

function validateUser(token){
    xhr = new XMLHttpRequest();
 xhr.onreadystatechange = function() {
     if (this.readyState == 4) {
         if(this.status == 200){
             if(xhr.responseText == "OK"){
                 alert("Permisos OK");
             }
         }
         else{
             alert("No tiene permisos suficientes");
             window.location.replace("http://localhost:3000/accessdenied.html");
         }
     }
     
 };
 
 xhr.open("POST", "http://localhost:3000/validate", true);
 xhr.setRequestHeader("authorization", token);
 xhr.send("");

}

window.onload = function(){
    this.document.getElementById("btnGuardar").addEventListener("click",function(){

        guardar();
    });
    document.getElementById("btnLogOff").onclick = function(){
        localStorage.removeItem("token");
        window.location.replace("http://localhost:3000/")
    }
   /* this.document.getElementById("btnUpload").addEventListener("click",function(){

        upload();
    });*/
    $('form').on('submit', function(e){
        e.preventDefault();  
    });
    $('#txtFile').on('change',function(e){
       if (e.target.files && e.target.files[0]) {
        var reader = new FileReader();
        reader.onload = function (arg) {
            console.log(reader.result);//Check Base64 string
          $('#imgFoto')
            .attr('src', reader.result)//.attr('src', arg.target.result) tambien funciona
            .attr('display','block')
            .width(150);
           // .height(200);
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
    cargarDatos();

};

function upload(){
    var formData = new FormData($("form")[0]);
    $.ajax({
        url: "http://localhost:3000/upload", 
        method:'POST',
        contentType: false,
        processData: false,
        data:formData,
        headers:{
            'authorization' : localStorage.token
        },
        success: function(result){
           console.log(result.message);
           cargarDatos();
           limpiarFormulario();
           postAModificar = null;
        },
        error: function(jqXHR,textStatus,errorThrown ){
            console.log(errorThrown);
        },
        complete:function(jqXHR, textStatus){
            console.log(textStatus);
        }
    });
}
function guardar(){
            //es un usuario autenticado?
        //miro localStorage
        var formData = new FormData($("form")[0]);
        
   // if(localStorage){
        //var token = localStorage.token;
        //if(token){
            //recupero los valores del dom
            var titulo = document.getElementById("txtTitulo");
            var articulo = document.getElementById("txtArticulo");
            var mas = document.getElementById("txtMas");
            //var foto = document.getElementById("txtFoto");
            var data;
            //es modificacion o alta?
            if(postAModificar){
                //ya no paso data, sino formData
                /*
                data = {
                    "titulo": titulo.value,
                    "articulo": articulo.value,
                    "mas": mas.value,
                    "collection": "posts",
                    "id": postAModificar.id,
                    "active" : postAModificar.active,
                    "created_dttm" : postAModificar.created_dttm
                }*/
                formData.append("collection","posts");
                formData.append("id",postAModificar.id);
                formData.append("active",postAModificar.active);
                formData.append("created_dttm",postAModificar.created_dttm);
                enviarModificacion(formData);
                //enviarModificacion(data);
            }
            else{
                //es nuevo. no tiene ID
               /* data = {
                    "titulo": titulo.value,
                    "articulo": articulo.value,
                    "mas": mas.value,
                    "collection": "posts"
                }*/
                formData.append("collection","posts");
                //muestro por consola las claves de formData
                for (var [key, value] of formData.entries()) { 
                    console.log(key, value);
                  }
                enviarAlta(formData);
            }   
       // }
      /*  else{
            $("#divLogin").modal();
        }*/
   // }
}

function enviarModificacion(data){
    $.ajax({
        url: "http://localhost:3000/modificar", 
        method:'POST',
        data:data,
        contentType: false,
        processData: false,
        headers:{
            'authorization' : localStorage.token
        },
        success: function(result){
           console.log(result);
           cargarDatos();
           limpiarFormulario();
           postAModificar = null;
        },
        error: function(jqXHR,textStatus,errorThrown ){
            console.log(errorThrown);
        },
        complete:function(jqXHR, textStatus){
            console.log(textStatus);
        }
    });
}

function limpiarFormulario(){
    /*document.getElementById("txtTitulo").value = "";
    document.getElementById("txtArticulo").value = "";
    document.getElementById("txtMas").value = "";*/
    document.getElementById("btnReset").click();
    document.getElementById("imgFoto").style.display = "none";
}
function enviarAlta(data){
    $.ajax({
        url: "http://localhost:3000/agregar", 
        method:'POST',
        //agrego contentType: false cuando tengo un mime type multipart/form-data con archivo incluido
        contentType: false,
        //agrego processData: false para que no quiera convertir a string formData a string
        processData: false,
        data:data,
        headers:{
            'authorization' : localStorage.token
        },
        success: function(result){
           console.log(result.message);
           cargarDatos();
           limpiarFormulario();
           postAModificar = null;
        },
        error: function(jqXHR,textStatus,errorThrown ){
            console.log(errorThrown);
        },
        complete:function(jqXHR, textStatus){
            console.log(textStatus);
        }
    });
}

function cargarDatos(){
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
           var resp = JSON.parse(this.response); 
           console.log(resp.message);
           refrescarTabla(resp.data);
           datos = resp.data;
        }
    };
    var url = "http://localhost:3000/traer?collection=posts";
    xhr.open("GET",url,true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
    
}

function refrescarTabla(data){
    var tabla = this.document.getElementById("tblPosts");
    var nuevasFilas="";
    //punto de parcial: mejorar carga
    for(var i in data){
        nuevasFilas += "<tr>";
        nuevasFilas += "<td>" + data[i].id + "</td>";
        nuevasFilas += "<td>" + data[i].created_dttm + "</td>";
        nuevasFilas += "<td>" + data[i].titulo + "</td>";
        nuevasFilas += "<td>" + data[i].articulo + "</td>";
        nuevasFilas += "<td><input type='button' class ='btn btn-warning' value='Modificar' onclick='modificar(" + data[i].id + ");'></td>";
        nuevasFilas += "<td><input type='button' class ='btn btn-danger' value='Borrar' onclick='borrar(" + data[i].id + ");'></td>";
        nuevasFilas += "</tr>";
    }
    //tabla.children[1].innerHTML = nuevasFilas;
    tabla.querySelector("tbody").innerHTML = nuevasFilas;
}

function borrar(id){
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
           var resp = JSON.parse(this.response); 
           console.log(resp.message);
           cargarDatos();
        }
    };
    xhr.open("POST","http://localhost:3000/eliminar",true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({"collection":"posts","id": id}));
    
}


function modificar(id){
    //obtengo el post que hay que modificar
    postAModificar = datos.find(x => x.id === id || x.id == id.toString());
    document.getElementById("txtTitulo").value = postAModificar.titulo;
    document.getElementById("txtArticulo").value = postAModificar.articulo;
    document.getElementById("txtMas").value = postAModificar.mas;
    document.getElementById("imgFoto").src = "http://localhost:3000/uploads/"+postAModificar.foto;
    document.getElementById("imgFoto").style.display = "block";
    document.getElementById("imgFoto").style.width = "150px";
     
    
}