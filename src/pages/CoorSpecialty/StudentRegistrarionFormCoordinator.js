import React, {useState,useEffect} from "react";
import LayoutBasic from "../../layouts/LayoutBasic";
import LayoutAdministrative from "../../layouts/LayoutAdministrative";
import {Form,Button,Row,Col,Alert} from 'react-bootstrap';
import { specialtyInsertApi } from "../../api/specialty";
import GeneralData from "../../components/Charts/GeneralData";
import AboutCompany from "../../components/Charts/AboutCompany";
import { ToastContainer, toast } from 'react-toastify';
import AboutJob from "../../components/Charts/AboutJob";
import AboutDurationPSP from "../../components/Charts/AboutDurationPSP";
import DirectBoss from "../../components/Charts/DirectBoss";
import CalificationFormStudent from "../../components/Charts/CalificationFormStudent";
import StateViewer,{StatesViewType} from "../../components/StateViewer/StateViewer";
import DocumentPlusIcon from "../../components/DocumentPlusIcon/DocumentPlusIcon";
import FileManagement from "../../components/FileManagement/FileManagement";
import useAuth from "../../hooks/useAuth";
import { getstudentInscriptionForm,registrationUpdateApiStudent,registrationUpdateApiStudentCamps,getListOfCountry,getLineBusinessList } from "../../api/registrationForm";
import { getAllDocsApi,uploadDocsApi } from "../../api/files";
import ShowFiles from "../../components/FileManagement/ShowFiles";

import './scss/StudentRegistrarionFormCoordinator.scss';
import { useParams } from "react-router-dom";
import PandaLoaderPage from "../General/PandaLoaderPage";
import { isNotEmptyObj } from "../../utils/objects";

//consultar a Oscar
const documents={

}

 const dataDummy = {
     "idAlumno": 1,
     "idAlumnoProceso": 1,
     "idFicha": 9,
     "documentsState": "Sin entregar",
     "approvalState": "Desaprobado",
     "generalData": {
         "name": "Oscar Daniel",
         "lastname": "Navarro Cieza",
         "code": "20186008",
         "email": "oscar.navarro@pucp.edu.pe",
         "cellphone": 929178606,
         "personalEmail": "oscar@prueba.com",
     },
     "aboutCompany": {
         "isNational": true,
         "ruc": "1234567890",
         "companyName": "Empresa SAC",
         "country":2,
         "lineBusiness":4,
          "companyAddress":""
     },
     "aboutJob": {
         "areaName": "TI",
         "jobTitle": "Analista de informaci??n",
         "activities": "Recopilar informaci??n de las base de datos y generar reportes"
     },
     "aboutPSP": {
         "dateStart":"",
         "dateEnd":"",
         "dailyHours": 6,
         "weekHours": 30
     },
     "aboutBoss": {
        "name":"Hugo Carlos",
         "area":"TI",
         "email":"hugoCar1548@gmail.com",
         "cellphone":"9856875564"
     },
     "calification": {
         "comments":"Buen trabajo"
     },
     "others": [
         {
             "idCampoProceso":28,
             "idCampoLlenado":7,
             "nombreCampo":"Pais",
             "seccion": "Sobre la PSP",
             "flag": "obligatorio",
             "valorAlumno": 'AA'
         },
         {
             "idCampoProceso":29,
             "idCampoLlenado":9,
             "nombreCampo": "Giro",
             "seccion": "Sobre el jefe",
             "flag": "opcional",
             "valorAlumno": "Electrodom??sticos"
         },
         {
             "idCampoProceso":30,
             "idCampoLlenado":10,
             "nombreCampo": "nuevodato",
             "seccion": "Sobre el jefe",
             "flag": "opcional",
             "valorAlumno": "xxxxx"
         }
     ]

}

const paisesDummy=[
    {
        "idPais":1,
        "nombrePais":"Per??"
    },
    {
        "idPais":2,
        "nombrePais":"Argentina"
    },
    {
        "idPais":3,
        "nombrePais":"Bolivia"
    }

]

const lineBussinessDummy=[
    {
        "idLineaNegocio":1,
        "nombreLineaNegocio":"TI"
    },
    {
        "idLineaNegocio":2,
        "nombreLineaNegocio":"Software"
    },
    {
        "idLineaNegocio":3,
        "nombreLineaNegocio":"Administracion"
    }

]

//const idAlumno=parseInt(arrayCadena[2]);
const maxFiles = 4;
let savedCoordinator=false;

export default function StudentRegistrarionFormCoordinator () {
    const {user} = useAuth();
    const idAlumno= useParams().idStudent;
    const [data, setData] = useState({});
    //const [data, setData] = useState(dataDummy);
    const [countries,setCountries]=useState({});
    //const [countries,setCountries]=useState(paisesDummy);
    const [lineBusiness,setLineBusiness]=useState({});
    //const [lineBusiness,setLineBusiness]=useState(lineBussinessDummy);
    const [fileList, setFileList] = useState([])
    const [docs, setDocs] = useState([]);
    const [studentDocs, setStudentDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [correctoFormato,setCorrectoFormato]=useState(true);
    let typeUser=user.tipoPersona;
    if(typeUser==="p"){
        typeUser=user.tipoPersonal;
    }else{

    }
    //console.log("El arrayCadena es: ",window.location.pathname);
    //debugger
    if(isNaN(idAlumno)) window.location.reload();

    console.log("El idAlumno es: ",idAlumno);
    
    useEffect(()=> {
        const fetchData = async () => {
            setLoading(true);
            const result = await getstudentInscriptionForm(idAlumno);
            const resultado=await getListOfCountry();
            const resultado2=await getLineBusinessList();
           // console.log("El result en la principal es: ",result);
            //console.log("El resultado en la principal es: ",resultado);
           // console.log("El resultado2 en la principal es: ",resultado2);
           
            if(result.success) {
                const resData = result.infoFicha.infoFicha;
                setData(resData);
            }
            
            if(resultado.success){
                //console.log("En el principal el resultado es: ",resultado);
                const countriesData = resultado.data;
                setCountries(countriesData);
            }
            
            if(resultado2.success){
                const lineData = resultado2.data;
                setLineBusiness(lineData);
            }
            setLoading(false);
        }
        fetchData()
    }, [setData])

    //sacamos los documentos subidos por el encargado
    useEffect(() => {
        const fetchData = async () => {
            const result = await getAllDocsApi(`${user.fidProceso}-FINS`, 0);
            if(result.success) {
                setDocs(result.docs)
            }
        }
        fetchData()
    },[setDocs])
    //sacamos los documentos subidor por el alumno
    useEffect(() => {
        const fetchData = async () => {
            const result = await getAllDocsApi(`${user.fidProceso}-FINS-${idAlumno}`, 1);
            if(result.success) {
                setStudentDocs(result.docs)
            }
        }
        fetchData()
    },[setStudentDocs])

    // const deliver = async () => {
    //     if(fileList.length <= maxFiles && fileList.length!==0) {
    //         const response = await uploadDocsApi(fileList, `${user.fidProceso}-FINS-${idAlumno}`, 1);
    //         if(response.success) {
    //             toast.success(response.msg, {
    //                 position: "top-right",
    //                 autoClose: 3000,
    //                 hideProgressBar: false,
    //                 closeOnClick: true,
    //                 pauseOnHover: true,
    //                 draggable: true,
    //                 progress: undefined,
    //             });
    //             window.location.reload();
    //        } else {
    //            toast.error(response.msg, {
    //                position: "top-right",
    //               autoClose: 3000,
    //                 hideProgressBar: false,
    //                 closeOnClick: true,
    //                 pauseOnHover: true,
    //                 draggable: true,
    //                 progress: undefined,
    //             });
    //        }
    //     }
    // }
    
    let isSaved=null;
    let canUpload=null;
    isSaved=true;
    canUpload=true;
    
    console.log("La data es: ",data);
    const typeDocumentState = (data.documentsState==="Sin entregar")? "fileEmpty": "success";
    let typeApprovalState = "";
    switch(data.approvalState) {
        case "Observado": typeApprovalState = "warning"; break;
        case "Sin entregar": typeApprovalState = "pending"; break;
        case "Sin calificar": typeApprovalState = "pending"; break;
        case "Aprobado": typeApprovalState = "success"; break;
        default: typeApprovalState = "error"; break;
    }
    console.log("El typeDocumentState es: ",typeDocumentState);
    console.log("El typeApprovalState es: ",typeApprovalState);
    const changeComments = e => {
        setData({
            ...data,
            calification: {
                ...data.calification,
                [e.target.name]: e.target.value
            }
        })
    }

    const insertCoordinator = async e => {
        e.preventDefault();
        let response=null;
        const newData = {
            ...data,
            // dateModified:new Date()
        }
        response = await registrationUpdateApiStudent(newData);
        if(!response.success){
            toast.error(response.msg, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }else{
            toast.success(response.msg, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            //deliver();
            setData(newData);
            isSaved=true;
            savedCoordinator=true;
            window.scrollTo(0, 0);
        } 
    }
    const goBack = e => {
        window.history.back();
    }
    if(loading || !isNotEmptyObj(data)) return <PandaLoaderPage type={typeUser}/>

    return (
         <LayoutAdministrative>
            <div className="container principal" style={{"padding":"1px"}}>
                <div className="row rows" style={{textAlign: "left"}}>
                    <h1>Ficha de Inscripci??n</h1>
                </div>
                <div className="row rows" style={{textAlign: "left"}}>
                    <p>
                    Aqu?? deber?? de rellenar la informaci??n solicitada m??s abajo para poder continuar con el proceso. Una vez que la complete, esta ser?? revisada para su aprobaci??n.
                    </p>
                    <p>
                    A continuaci??n se presenta la r??brica para la ficha de inscripci??n:
                    </p>
                    <ShowFiles docs={docs} />
                </div>
                <div className="row rows">
                    <StateViewer states={[
                            StatesViewType[typeDocumentState]("Documentos", data.documentsState),
                    StatesViewType[typeApprovalState]("Aprobaci??n", data.approvalState)]}/>
                </div>
                <div className="row rows" style={{textAlign: "left",marginBottom:"0px"}}>
                    <h2 style={{marginBottom:"0px"}}>Datos por rellenar</h2>
                </div>
                <div className="row rows">
                    <GeneralData data={data} setData={setData} imStudent={isSaved} isSaved={isSaved} correctoFormato={correctoFormato} setCorrectoFormato={setCorrectoFormato}/>   
                </div>
                <div className="row rows">
                    <AboutCompany data={data} setData={setData} notgrabado={isSaved} countries={countries} lineBusiness={lineBusiness} correctoFormato={correctoFormato} setCorrectoFormato={setCorrectoFormato}/>
                </div>
                <div className="row rows">
                    <AboutJob data={data} setData={setData} notgrabado={isSaved} correctoFormato={correctoFormato} setCorrectoFormato={setCorrectoFormato}/>
                </div>
                <div className="row rows">
                    <AboutDurationPSP data={data} setData={setData} notgrabado={isSaved} correctoFormato={correctoFormato} setCorrectoFormato={setCorrectoFormato}/>
                </div>
                <div className="row rows">
                    <DirectBoss data={data} setData={setData} notgrabado={isSaved} correctoFormato={correctoFormato} setCorrectoFormato={setCorrectoFormato}/>
                </div>
                <div className="row rows">
                    <CalificationFormStudent data={data} setData={setData} notgrabado={savedCoordinator}/>
                </div> 
                <div className="row rows">
                    <div className="container Comments">
                        <nav className="navbar navbar-fixed-top navbar-inverse bg-inverse "style={{ backgroundColor: "#E7E7E7"}}>
                            <h3 style={{"marginLeft":"15px"}}>Observaciones</h3>
                        </nav>
                        <div className="row rows" >
                            <Form.Control className="observaciones"
                                    placeholder="Esciba las observaciones de la entrega" 
                                    onChange={changeComments}
                                    value={data.calification.comments}
                                    name="comments"
                                    disabled={savedCoordinator}
                                    style={{"marginBottom":"10px !important"}}
                                    as="textarea"
                                    rows={6}/>
                        </div> 
                    </div>
                </div>
                <div className="row rows" >
                <div className="col-sm-2 subtitles">
                </div>
                <div className="col-sm-4 botons">
                    <Button variant="primary" onClick={goBack} style={{"marginBottom":"4px"}}>Regresar</Button>
                </div>
                <div className="col-sm-4 botons">
                    <Button variant="primary" onClick={insertCoordinator} style={{"marginBottom":"4px"}}>Guardar</Button>
                </div>
                <div className="col-sm-2 subtitles">
                </div>
                </div> 
                <div className="row rows">
                    
                </div>
            </div>
        </LayoutAdministrative>
    )

}
