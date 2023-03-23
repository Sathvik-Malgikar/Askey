socket = io.connect(`http://${location.hostname}:${location.port}`)

let uname =  document.getElementById("name") ;
let others = document.getElementById("others");
let pgdisplay = document.getElementById("pgdisplay");
let register  = document.getElementById("register");
let mute  = document.getElementById("mute");
let yell  = document.getElementById("yell");
let bgm = document.getElementById("bgm");
let progress = 0

function toast(msg_arg){
    yell.innerText = msg_arg
    setTimeout(()=>{
        yell.innerText=''
    },3000)
}

mute.onclick = (e)=>{
    e.preventDefault()
    if(!bgm.paused)
    bgm.pause()
    else
    bgm.play()
}

socket.on("getready" ,()=>{
document.documentElement.classList.add("gamemode")

toast("Found match, Get, set, type in 3 seconds ")

})
socket.on("loadtext" ,(text)=>{
loadtext(text)
bgm = document.getElementById("bgm")
bgm.play()

})



socket.on("yell" ,(file)=>{
if(file=="bigboy"){
    
    toast ( "what's the hurry big boy?")
   
}
if(file=="mymama"){
    toast ( "my mama types faster than ya!")
    
}
if(file=="youdaman"){
    toast  ("you da man baby!")
    alert("woo-hoo , you beat everyone else!")
    
    
}
if(file=="smooth"){
    toast( "that was smooth")
    
}
if(file=="granddad"){
   toast ("take that, granddad")
    
}
if(file=="aintallday"){
    toast ("you aint got all day!")
    
}
if(file=="aintleague"){
    toast ("this aint your league")
    
}
let aud = document.createElement("audio")
aud.src = `./fx/${file}.mp3`
aud.play()

})

socket.on("servrestart" , ()=>{
    alert("no other players left in lobby, server will restart !")
    location.reload()
})


socket.on("currentplayers",(names,progresses,wpms)=>{

    if (names.includes(uname.value) && register) 
    register.remove();

//  console.log(names);
 others.innerHTML=''
 pgdisplay.innerHTML=''
   for (let i = 0; i < names.length; i++) {
    let element = names[i];
    
if (progresses && wpms){
console.log(progresses,wpms);
    crtli(element,progresses[i],wpms[i])
}
    else
    crtli(element,0,0)
   }

})
socket.on("nameused",()=>{

  alert("try being original for once !")
})
socket.on("gameover",(name)=>{

  alert(`speed up you turtle! ${name} WON the match`)
})

register.onclick = ()=>{
    if(uname.value == '') {
        alert("enter username")
        return
    }
    socket.emit("register",uname.value)
    document.onkeydown = gettyped
    progress =0;
    document.onscroll = (event)=>{
        // console.log("log");
        event.preventDefault()
        window.scrollTo(0,0);
    }
    document.addEventListener("incr" , pgupdate) 
    // setInterval(pgupdate, 500);
}

document.addEventListener("win",()=>{
    socket.emit("iwon",uname.value)
    
})


function pgupdate(event){
    progress = event.data
    socket.emit('prgply',uname.value , progress)
}


function crtli(nm,prg,wpm){
    // console.log(id);
    
    let p = document.createElement("p")
    let pbar = document.createElement("progress")
    let wpm_p = document.createElement("p")
    wpm_p.innerText = wpm +" WPM"
    p.innerHTML = nm
    pbar.id = nm
    pbar.value = prg
    pbar.max = 100
    p.appendChild(pbar)
    p.appendChild(wpm_p)

    let ele = document.createElement("li")
    ele.innerHTML = nm
    others.appendChild(ele)
    pgdisplay.appendChild(p)
    ele.onclick = (event)=>{
        
            event.preventDefault()
            console.log("you clicked on",nm);
            socket.emit("cnto",{"myid" : document.getElementById("uid").innerText , "id" : nm})
        
    }
    // document.getElementById("others").innerHTML+="<br/>"
}

