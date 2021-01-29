const socket=io();
socket.on("paired", () => {
  notice("an user has acceped your challenge",3000);
  paired=true;
  refresh();
});
socket.on('move',msg=>{
    executeMessage(msg);
    turnOf=3-turnOf
    refresh();
    
})
socket.on('kill',msg=>{
    executeMessage(msg);
    refresh()
})
socket.on('!multiKill',()=>{
    turnOf=3-turnOf;
    refresh()
})
socket.on(
    'firstPlayer',()=>{turnOf=1}
)
socket.on(
    'opponentLeft',()=>{notice('your opponent left the game')}
)

var canvas = document.getElementById("board");
const vw = Math.min(document.documentElement.clientWidth , window.innerWidth )//viewport width
const vh = Math.min(document.documentElement.clientHeight, window.innerHeight)
let x=Math.min(vw/6,vh/10)||100//magnification
let m=x/2//margin
let fromX;
let fromY;
let toX;
let toY;
let turnOf=2
let paired =false;//variable to track paired status
canvas.width=4*x+2*m-1 ;canvas.height=8*x+2*m-1 // -1 is bugfix
var ctx = canvas.getContext("2d");
let timeoutId
let piecePosition;
 function resetBoard() {
    piecePosition=   [//0 invalid pos 1 blue 2 red 3 empty ;
        [2,0,2,0,2],
        [0,2,2,2,0],
        [2,2,2,2,2],
        [2,2,2,2,2],
        [3,3,3,3,3],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [0,1,1,1,0],
        [1,0,1,0,1],
         ];
 }
 resetBoard();
refresh();
let canReach = {"11": ["21","00","22"],
"12": ["22","02","13"],
"13": ["23","03","22","12","02","04","14","24"],
"14": ["24","04","13","15"],
"15": ["25","05","24","14","04","06","16","26"],
"16": ["26","06","15",],
"17": ["27","26","08"],
"20": ["40","00","21"],
"21": ["31","11","20","22"],
"22": ["32","12","31","21","11","13","23","33"],
"23": ["33","13","22","24"],
"24": ["34","14","33","23","13","15","25","35"],
"25": ["35","15","24","26"],
"26": ["36","16","35","25","15","17","27","37"],
"27": ["37","17","26","28"],
"28": ["48","08","27"],
"31": ["51","21","40","22",],
"32": ["42","22","33"],
"33": ["43","23","42","32","22","24","34","44"],
"34": ["44","24","33","35"],
"35": ["45","25","44","34","24","26","36","46"],
"36": ["46","26","35",],
"37": ["57","27","26","48"],
"40": ["50","20","31"],
"42": ["52","32","33","43"],
"43": ["53","33","42","44"],
"44": ["54","34","43","33","35","45"],
"45": ["55","35","44","46"],
"46": ["56","36","45","35"],
"48": ["58","28","37"],
"00": ["20","11"],
"02": ["12","03","13"],
"03": ["13","02","04"],
"04": ["14","13","03","05","15"],
"05": ["15","04","06"],
"06": ["16","15","05"],
"08": ["28","17"]};
function boardDraw(){
    lineDraw(0,0,4,4);lineDraw(4,4,0,8);lineDraw(0,8,4,8);lineDraw(4,8,0,4);lineDraw(0,4,4,0);lineDraw(4,0,0,0);
    rectangleDraw(0,2,4,4)
    lineDraw(0,2,4,6);lineDraw(4,2,0,6)//main diagnols
    lineDraw(1,2,1,6);lineDraw(3,2,3,6);//vertical lines
    lineDraw(0,3,4,3);lineDraw(0,5,4,5);//Hor lines
    lineDraw(1,1,3,1);lineDraw(1,7,3,7)//melia hor line
    lineDraw(2,0,2,8);lineDraw(0,4,4,4)//central line
}
function lineDraw(x1,y1,x2,y2){
    ctx.beginPath();
    ctx.moveTo(x1*x+m,y1*x+m);
    ctx.lineTo(x2*x+m,y2*x+m);
    ctx.stroke();
    
};
function circleDraw(x1,y1,beadColor='black',radius=x/6){
    ctx.beginPath();
    ctx.arc(x1*x+m, y1*x+m, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle=beadColor;
    ctx.fill();
}
function rectangleDraw(x1,y1,a,b){
    ctx.beginPath();
ctx.rect(x1*x+m, y1*x+m, a*x, b*x);
ctx.stroke();
};
function pieceDraw(){
for (let i = 0; i < piecePosition.length; i++) {
    const row = piecePosition[i];
    for (let j = 0; j < row.length; j++) {
        const piece = row[j];
      if (piece==2) {
          circleDraw(j,i,'red')
      } else if(piece==1) {
          circleDraw(j,i,'blue')
      }
    
    }
}
}
function highlight(x1,y1,color='yellow'){
    var grd = ctx.createRadialGradient(x1*x+m,y1*x+m,x/20,x1*x+m,y1*x+m,x/4);
    grd.addColorStop(0,"rgb(0,0,0,0)");
    grd.addColorStop(1,color);
    ctx.beginPath();
    ctx.arc(x1*x+m, y1*x+m, x/4, 0, 2 * Math.PI);
    // ctx.stroke();
    ctx.fillStyle = grd;
    ctx.fill()
}
function clickHandler(evnt) {
    if(!paired){return notice("Still searching for opponent",2000)}
    if(turnOf==2){return notice('let your opponent move first',1000)}
    let rect = canvas.getBoundingClientRect();
    let borderWidth = +((getComputedStyle(document.getElementById('board'), null).getPropertyValue('border-left-width')).replace('px', ''))
    let xcanvas = evnt.clientX - rect.left - borderWidth
    let ycanvas = evnt.clientY - rect.top - borderWidth;
    fromX = Math.floor(xcanvas / x)//0-4
    fromY = Math.floor(ycanvas / x)//0-8
    if (piecePosition[fromY][fromX]!=1){return}
    id('board').setAttribute('onclick','pieceMover(event)')
    highlight(fromX,fromY,'green');
    canReach[String(fromX)+String(fromY)].forEach((item)=>{
        if(piecePosition[+item[1]][+item[0]]==3) {
            highlight(+item[0],+item[1])
        }
        if(piecePosition[+item[1]][+item[0]]==2&&piecePosition[2*+item[1]-fromY][2*+item[0]-fromX]==3) {
            highlight(2*+item[0]-fromX,2*+item[1]-fromY,'black')
        }
        
    })
}
function pieceMover(evnt,killStreaking=false) {
    
    let rect = canvas.getBoundingClientRect();
    let borderWidth = +((getComputedStyle(document.getElementById('board'), null).getPropertyValue('border-left-width')).replace('px', ''))
    let xcanvas = evnt.clientX - rect.left - borderWidth
    let ycanvas = evnt.clientY - rect.top - borderWidth;
     toX = Math.floor(xcanvas / x)//0-4
     toY = Math.floor(ycanvas / x)//0-8
    
    if(canReach[String(fromX)+String(fromY)].includes(String(toX) + String(toY))&&!killStreaking){
      if (piecePosition[toY] && piecePosition[toY][toX]==3) {
          piecePosition[toY][toX] = piecePosition[fromY][fromX]
          piecePosition[fromY][fromX] = 3;
          turnOf = 3 - turnOf;
          socket.emit('move',`${fromX}${fromY}${toX}${toY}`)
      };
    }
    let canKill=piecePosition[(fromY+toY)/2] && piecePosition[(fromY+toY)/2][(fromX+toX)/2]==2&&piecePosition[toY] && piecePosition[toY][toX]==3
    if(canKill){
        if(killStreaking&&timeoutId){clearTimeout(timeoutId)}
        piecePosition[fromY][fromX]=3; piecePosition[toY][toX]=turnOf;piecePosition[(fromY+toY)/2][(fromX+toX)/2]=3;
        //send kill message
        socket.emit('kill',`${fromX}${fromY}${toX}${toY}`)
        if(!killStreakPossible(`${toX}${toY}`)){
            turnOf=3-turnOf;
            socket.emit('!multiKill');
            id('board').setAttribute('onclick','clickHandler(event)')
            //  socket assure no multikill
        } else{
            fromX=toX;
            fromY=toY;
            id('board').setAttribute('onclick','pieceMover(event,true)');
            notice('You have 9 seconds to perform killstreak',3000)
            timeoutId= setTimeout(() => {
                turnOf=3-turnOf; 
                socket.emit('!multiKill')
                //assure no multikill
            }, 9000);
        }

         refresh();
         return;
     }  
    refresh();
    id('board').setAttribute('onclick','clickHandler(event)')
}
function id(elementId){return document.getElementById(elementId)};
function killStreak(evnt){
    let rect = canvas.getBoundingClientRect();
    let borderWidth = +((getComputedStyle(document.getElementById('board'), null).getPropertyValue('border-left-width')).replace('px', ''))
    let xcanvas = evnt.clientX - rect.left - borderWidth
    let ycanvas = evnt.clientY - rect.top - borderWidth;
    let xclicked = Math.floor(xcanvas / x)//0-4
    let yclicked = Math.floor(ycanvas / x)//0-8
    let streakMissed=(piecePosition[yclicked][xclicked]==turnOf)
    if(streakMissed){
        clickHandler(evnt)
    } else if (piecePosition[(yclicked + toY) / 2] && piecePosition[(yclicked + toY) / 2][(xclicked + toX) / 2] == turnOf) {
        turnOf=3-turnOf;
        fromX = toX;
        fromY = toY;
        pieceMover(evnt)
    }
}
function refresh() {
    ctx.clearRect(0,0,canvas.width,canvas.height)
    boardDraw();
    pieceDraw();
    turnUpdate();
    barrackCheck()

    function turnUpdate() { //tells users whose turn it is
        if (turnOf == 2) {
            ctx.save();
            ctx.scale(-1, -1)
            ctx.fillStyle = 'Red';
            ctx.font = `${x/3}px Arial`
            ctx.fillText('Your Turn', -2 * x + m, -5 / 2 * x + m);
            ctx.restore();
        }
        if (turnOf == 1) {
            ctx.fillStyle = 'blue';
            ctx.font = `${x/3}px Arial`;
            ctx.fillText('Your Turn', 3 * x + m, 6.5 * x + m)

        }
    }
}
function barrackCheck(){
    if( piecePosition[0][0]==3&&
        piecePosition[0][2]==3&&
        piecePosition[0][4]==3&&
        piecePosition[1][1]==3&&
        piecePosition[1][2]==3&&
        piecePosition[1][3]==3
        ){
        piecePosition[0][0]=0;
        piecePosition[0][2]=0;
        piecePosition[0][4]=0;
        piecePosition[1][1]=0;
        piecePosition[1][2]=0;
        piecePosition[1][3]=0;
        lineDraw(1,1.5,3,1.5);
        id('notice').innerHTML=`A barrack can't be re-entered once emptied`
        };
        if( piecePosition[8][0]==3&&
            piecePosition[8][2]==3&&
            piecePosition[8][4]==3&&
            piecePosition[7][1]==3&&
            piecePosition[7][2]==3&&
            piecePosition[7][3]==3
            ){
            piecePosition[8][0]=0;
            piecePosition[8][2]=0;
            piecePosition[8][4]=0;
            piecePosition[7][1]=0;
            piecePosition[7][2]=0;
            piecePosition[7][3]=0;
            lineDraw(1,6.5,3,6.5);
            id('notice').innerHTML=`A barrack can't be re-entered once emptied`
            }
}
function killStreakPossible(p) {
   let returnValue = false
    canReach[p].forEach(
        e => {
            if (pp(e) == 2 && pp(ap(p, e)) == 3) {
                returnValue = true;
            }
            
        }
    )
    return returnValue
    }
    

function pp(coordinateString,value=undefined) {
    if (value==undefined) {
      return piecePosition[coordinateString[1]][coordinateString[0]]
    }
    piecePosition[coordinateString[1]][coordinateString[0]]=value
  };
  function ap(a1,a2) {//third term of ap
    a1=String(a1)
    a2=String(a2);
    let a3= String(2*+a2[0]-+a1[0])+String(2*+a2[1]-+a1[1])
    return a3
  }
  function executeMessage(mdata) {
      let p1 = mdata.slice(0, 2);
      let p2 = mdata.slice(2, 4);

      p1 = ap(p1, '24'); //reflects the data about center
      p2 = ap(p2, '24');

  pp(p1,3);
  pp(p2,2);
  let midPointx=(+p1[0]+(+p2[0]))/2;
  let midPointy=(+p1[1]+(+p2[1]))/2
  if(Number.isInteger(midPointx)&&Number.isInteger(midPointy)&&pp(`${midPointx}${midPointy}`)==1){
      pp(`${midPointx}${midPointy}`,3)
    }
  }

  //style.js
  const overlay = document.querySelector(".overlay");
nt = document.getElementById("notice");
let timeout;
function notice(message, time = false) {
  overlay.style.display = "flex";
  nt.innerHTML = message;
  if (time) {
    if (typeof timeout) {
      clearTimeout(timeout);
    }
    setTimeout(() => {
      fade();
    }, time);
  }
}
function dismiss() {
  overlay.style.display = "none";
}
function fade(selector = ".overlay") {
  element = document.querySelector(selector);
  if (element.style.opacity && element.style.opacity < 0.1) {
    element.style.display = "none";
    element.style.opacity = 1;
    return;
  }
  element.style.opacity = (element.style.opacity || 1) / 1.08;
  setTimeout(() => fade(selector), 20);
};

function showLastMove(x1,y1,x2,y2) {
    ctx.save();
    ctx.lineWidth=5;
    ctx.beginPath();
    ctx.moveTo(x1*x+m+5,y1*x+m+5);
    ctx.lineTo(x2*x+m+5,y2*x+m+5);
    ctx.font = `${x/2}px Arial`;
    ctx.strokeStyle ='rgb(0, 153, 51,.6)';
    ctx.stroke();
    ctx.restore();
}