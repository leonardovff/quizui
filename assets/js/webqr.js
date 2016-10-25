var gCtx = null;
var gCanvas = null;
var c=0;
var stype=0;
var gUM=false;
var webkit=false;
var moz=false;
var v=null;
var get = {
    item: function(item, dom){
        return typeof(dom)!="undefined"?dom.querySelector(item):document.querySelector(item);
    },
    all: function(itens, dom){
        return typeof(dom)!="undefined"?dom.querySelectorAll(itens):document.querySelectorAll(itens);
    }
},
limparFeedback = null;

var vidhtml = '<video id="video" autoplay></video>';

function initCanvas(w,h)
{
    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}


function captureToCanvas() {
    if(stype!=1)
        return;
    if(gUM)
    {
        try{
            gCtx.drawImage(v,0,0);
            try{
                qrcode.decode();
            }
            catch(e){       
                console.log(e,e.indexOf("found 0"));
                if(e.indexOf("found 0") === -1){
                    if(limparFeedback === null){
                        console.log("entrou");
                        get.item("#result").innerHTML="- escaneando -";
                    } else {
                        clearInterval(limparFeedback);
                    }
                    lfimparFeedback = setTimeout(function(){
                        limparFeedback = null;
                        get.item("#result").innerHTML="";    
                    }, 500);

                }
                setTimeout(captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
        };
    }
}
var controlFullScreen = function (el){
    return {
        open: function(){
            if (el.requestFullscreen) {
              el.requestFullscreen();
            } else if (el.msRequestFullscreen) {
              el.msRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
              el.mozRequestFullScreen();
            } else if (el.webkitRequestFullscreen) {
              el.webkitRequestFullscreen();
            }
        },
        close: function(){
            if (el.exitFullscreen) {
              el.exitFullscreen();
            } else if (el.msExitFullscreen) {
              el.msExitFullscreen();
            } else if (el.mozExitFullscreen) {
              el.mozExitFullscreen();
            } else if (el.webkitExitFullscreen) {
              el.webkitExitFullscreen();
            } 
        }
    }
}
   
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function read(a)
{
    var html="<br>";
    html+="valor: <b>"+htmlEntities(a)+"</b><br><br>";
    // document.getElementById("result").innerHTML=html;
    console.log(a);
    get.item("#todo>section[data-status='step-atual']").dataset.status = "no-active";
    get.item("#pergunta").dataset.status = "step-atual";
}   

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}
function success(stream) {
    if(webkit)
        v.src = window.URL.createObjectURL(stream);
    else
    if(moz)
    {
        v.mozSrcObject = stream;
        v.play();
    }
    else
        v.src = stream;
    gUM=true;
    setTimeout(captureToCanvas, 500);
}
        
function error(error) {
    gUM=false;
    return;
}
function setEvents(){
    var entrar = get.item("#entrar"),
    iniciar = get.item("#fullscreen"),
    respostas = get.all("#pergunta ul>li"),
    responder = get.item("#confirmar");

    respostas.forEach(function(resposta){
        resposta.addEventListener('click',function(){
            if(this.className.toLowerCase().search('checked')==-1){
                if(get.all("#pergunta ul>li.checked").length>0){
                    get.item("#pergunta ul>li.checked").className = "";
                } else {
                    get.item("#pergunta").dataset.statusVotacao = "selected"
                }
                this.className = "checked";
            } 
        },false);
    });

    iniciar.addEventListener('click',function(){ 
        get.item(".step-captura[data-status='active']").dataset.status = "no-active";
        get.item("#instrucao-leitura").dataset.status = "active";
    },false);
    alert(entrar);
    alert(typeof(entrar));
    entrar.addEventListener('click',function(){
        alert("entrou"); 
        get.item("#todo>section[data-status='step-atual']").dataset.status = "no-active";
        get.item("#captura").dataset.status = "step-atual";
        var fullscren = controlFullScreen(document.querySelector('body'));
        fullscren.open();
    },false);
    
    responder.addEventListener('click',function(){ 
        get.item("#pergunta").dataset.statusVotacao = "obrigado";
    },false);
    
}
function load()
{
    setEvents();
    if(isCanvasSupported() && window.File && window.FileReader)
    {
        alert("entrou");
        initCanvas(800, 600);
        qrcode.callback = read;
        //document.getElementById("mainbody").style.display="inline";
        setwebcam();
    }
    else
    {
        //document.getElementById("mainbody").style.display="inline";
        document.getElementById("outdiv").innerHTML='<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>'+
        '<br><p id="mp2">sorry your browser is not supported</p><br><br>'+
        '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
    }
}

function setwebcam()
{
    
    var options = true;
    if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)
    {
        try{
            navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
              devices.forEach(function(device) {
                if (device.kind === 'videoinput') {
                  if(device.label.toLowerCase().search("front") >-1)
                    options={'deviceId': {'exact':device.deviceId}, 'facingMode':'environment'} ;
                }
                console.log(device.kind + ": " + device.label +" id = " + device.deviceId);
              });
              setwebcam2(options);
            });
        }
        catch(e)
        {
            console.log(e);
        }
    }
    else{
        console.log("no navigator.mediaDevices.enumerateDevices" );
        setwebcam2(options);
    }
    
}
function setwebcam2(options)
{
    if(stype==1)
    {
        setTimeout(captureToCanvas, 500);    
        return;
    }
    console.log(options);
    var n=navigator;
    document.getElementById("outdiv").innerHTML = vidhtml;
    v=document.getElementById("video");
    //options.optional = [{sourceId: camId}];

    if(n.getUserMedia)
    {
        webkit=true;
        n.getUserMedia({video: options, audio: false}, success, error);
    }
    else
    if(n.webkitGetUserMedia)
    {
        webkit=true;
        n.webkitGetUserMedia({video:options, audio: false}, success, error);
    }

   // document.getElementById("webcamimg").style.opacity=1.0;

    stype=1;
    setTimeout(captureToCanvas, 500);        
}