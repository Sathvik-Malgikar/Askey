
// let progress = document.getElementById("progress")
let playground = document.getElementById("playground")
let playground_ol = document.getElementById("playground_ol")
let target='';
let err= document.createElement("audio")

function loadtext(texttoload){

    playground.innerText = texttoload
    target = playground.innerText
}

let text = ""
const incrEvent = new Event("incr")
const winEvent = new Event("win")
function check(ec){
if (ec==32){
s=' '
}else{
    s=  String.fromCharCode(ec).toLowerCase()
}
    
    return target.startsWith(text+s)
}

function increment(){

    incrEvent.data = playground_ol.innerText.length / playground.innerText.length   * 100
    document.dispatchEvent(incrEvent)

}

function gettyped(event){
    if(!check(event.keyCode)) {


        return
    }

    event.preventDefault()
    if (event.keyCode==32) {
        text+=" "
        // console.log(text);
        playground_ol.innerHTML = text
        return
    }
    if (event.keyCode >= 65 && event.keyCode <= 90) {
       text+=(String.fromCharCode (  event.keyCode)).toLowerCase()
        playground_ol.innerHTML = text
    }

    increment()


    if (text == target) {
        document.dispatchEvent(winEvent)
    }
    
}






