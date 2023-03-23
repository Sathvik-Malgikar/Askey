const express = require('express')
const os = require('os')
// const path = require('path')
const http = require('http')
const { exit } = require('process')
// const reqip = require("request-ip")
const app = express()
const port = 3000

const server= http.createServer(app)

// reqip.getClientIp()

const netint = os.networkInterfaces()
// console.log(netint["Wi-Fi"].slice(-1));
if(!netint["Wi-Fi"])
{
    console.log("Wi-Fi is not connected,exiting..");
    exit(1)
}
const ip = netint["Wi-Fi"].slice(-1)[0].address

const io = require("socket.io")(server)

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
    }
    return result;
    }
// key : uname,  { socket, sid ,progress }
let players = {}
let sidtoname = {}
let names = []
let progresses =[];
let clock = 0
let wpms = []
setInterval(()=>{clock+=1},1000)
let rept = setInterval(publish,200)
yell()
let pndsocket;


let yells_lead = ["smooth","granddad","bigboy"]
let yells_lose = ["mymama","aintallday","aintleague"]

let txtchoices =[
    "ask especially collecting terminated may son expression extremely eagerness principle estimable own was man men received far his dashwood subjects new my sufficient surrounded an companions dispatched in on connection too unaffected expression led son possession new smiling friends and her another leaf she does none love high yet snug love will up bore as be pursuit man son musical general pointed it surprise informed mr advanced do outweigh","of friendship on inhabiting diminution discovered as did friendly eat breeding building few nor object he barton no effect played valley afford period so to oppose we little seeing or branch announcing contrasted not imprudence add frequently you possession mrs period saw his houses square and misery hour had held lain give yet","insipidity the sufficient discretion imprudence resolution sir him decisively proceed how any engaged visitor explained propriety off out perpetual his you feel sold off felt nay rose met you we so entreaties cultivated astonished is was sister for few longer mrs sudden talent become done may bore quit evil old mile if likely am of beauty tastes","it as announcing it me stimulated frequently continuing least their she you now above going stand forth he pretty future afraid should genius spirit on set property addition building put likewise get of will at sell well at as too want but tall nay like old removing yourself be in answered he consider occasion get improved him she eat letter by lively oh denote an","as am hastily invited settled at limited civilly fortune me really spring in extent an by judge but built gay party world of so am he remember although required bachelor unpacked be advanced at confined in declared marianne is vicinity"
]
let chosentext=txtchoices[ Math.floor((Math.random()*txtchoices.length))]

function yell(){
if(names.length<2) {
    if(names.length==0)
    {
        setTimeout(yell,10000)
        return
    }
    setTimeout(yell,10000/names.length)
    return
}

let ylt = names [ Math.floor((Math.random()*names.length))]
// console.log(ylt);


if(names.indexOf(ylt) == 0){
//lead
players[ylt].socket.emit("yell",yells_lead [ Math.floor((Math.random()*yells_lead.length))])
}else{
    //lose
    players[ylt].socket.emit("yell",yells_lose [ Math.floor((Math.random()*yells_lose.length))])
}
console.log("yelled at" , ylt);
setTimeout(yell,10000/names.length)




}

function getsetgo(sock) 
{
    sock.emit("getready")
    setTimeout(()=>{

        sock.emit("loadtext" , chosentext)
        clock=0
    },3050)
}


function publish()
{
    if(progresses.length==0){
        // console.log("empty publish!");
        io.emit("currentplayers" , names)
        return
    }

    wpms= progresses.map(ele=>  ((ele/100* chosentext.length)/4.7 /clock *60).toFixed(3) )

    io.emit("currentplayers" , names,progresses,wpms)
}


io.on("connection",(socket)=>{

    socket.on("register",(name)=>{
        if(names.includes(name))
        {
            socket.emit("nameused")
            return
        }
        let uid = makeid(5);
players[name] = { "socket" : socket , "uid" : uid , "progress" : 0}
sidtoname[socket.id] = name;
names.push(name)

        if(names.length>=2){
            getsetgo(socket)
            
            if (pndsocket){
                clock =0;
                
                getsetgo(pndsocket)
                pndsocket=null
            }
        }
        else{
            pndsocket = socket;
        }
        io.emit("currentplayers" , names)
    })
    
    socket.on("disconnect",()=>{
        console.log("close");
        let name = sidtoname[socket.id]
        delete players[name]
        names = names.filter(   item => item !== name)
        delete sidtoname[name]
        io.emit("currentplayers" , names)
        if(names.length<2) {
            chosentext = txtchoices[ Math.floor((Math.random()*5))]
            console.log("only one player left, server restarted!");
            players = {}
            sidtoname = {}
            names = []
            progresses =[];
            clock = 0
            wpms = []
            io.emit("servrestart")
            
        }
    })
    
    socket.on("prgply",(name,prg)=>{

        if (!names.includes(name)) return

        players[name].progress = prg

        progresses = names.map(ele=>players[ele].progress) 
        let swi;
        let temp;
        for (let i = 0; i < progresses.length; i++) {
            
            
           swi = progresses.findIndex( a=>a == Math.max( ...progresses.slice(i)  ))
           
           if(swi!=i){
            temp = names[swi]
            names[swi] = names[i]
            names[i] = temp

            temp = progresses[swi]
            progresses[swi] = progresses[i]
            progresses[i] = temp
           }
           
            
        }

        // if (progresses[0] > 70){

        //     // players[names[0]].socket.emit("yell","bigboy")
        //     // players[names.slice(-1)[0]].socket.emit("yell","mymama")
        // }

        publish(progresses)
    })
    
    socket.on("iwon",(name)=>{

        
        socket.broadcast.emit("gameover" , name)
        socket.emit("yell","youdaman")
    })


    
})

app.get('/',(req,res)=>{
    res.redirect('/player.html')
})

app.use(express.static("public"))



server.listen(port, ip )
console.log(` server up and running, listening at http://${ip}:${port}/`);