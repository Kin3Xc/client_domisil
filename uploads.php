<?php
    //comprobamos que sea una petición ajax
    if(!empty($_FILES['logoEmpresa']))
    {

        //obtenemos el archivo a subir
        $archivo = $_FILES['logoEmpresa'];
        //obetenemos nombre del archivo
        // $file = $_FILES['logoEmpresa']['name']; 
        $file = $_POST['nombre']; 
        //comprobamos si existe un directorio para subir el archivo
        //si no es así, lo creamos
        if(!is_dir("uploads/"))
            mkdir("uploads/", 0777);

        //comprobamos si el archivo ha subido
        if ($file && move_uploaded_file($_FILES['logoEmpresa']['tmp_name'],"uploads/".$file))
        {
           // sleep(3);//hacer que la petición dure por lo menos 3 segundos es opcional
           echo $file;//devolvemos el nombre del archivo para pintar la imagen
        }
    }else{
        throw new Exception("Error Processing Request", 1);   
    }
?>