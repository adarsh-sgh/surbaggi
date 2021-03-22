const path=require('path');
const http=require('http');
const express=require('express');
const socketio=require('socket.io')

let unpairedUser=null
const rooms={}

const app=express();
const server=http.createServer(app);
const io =socketio(server);
app.use(express.static(path.join(__dirname,'public')));
io.on('connection',socket=>{
    console.log('a user connected with id = '+socket.id)
    if(unpairedUser){
        socket.join(unpairedUser);
        rooms[socket.id]=unpairedUser;
        io.to(unpairedUser).emit('paired')
        unpairedUser=null;
        
    }else{
        socket.emit('firstPlayer')
        unpairedUser=socket.id
        socket.join(socket.id)
    }
    socket.on('move',msg=>{
        socket.broadcast
        .to(rooms[socket.id]||socket.id)
        .emit(
            'move',msg
        )
    })
    socket.on('kill',msg=>{
        socket.broadcast
        .to(rooms[socket.id]||socket.id)
        .emit(
            'kill',msg
        )
    })
    socket.on('!multiKill',msg=>{
        socket.broadcast
        .to(rooms[socket.id]||socket.id)
        .emit(
            '!multiKill',msg
        )
    })
    socket.on('name',msg=>{
        socket.broadcast
        .to(rooms[socket.id]||socket.id)
        .emit(
            'name',msg
        )
    })
    socket.on('disconnect',()=>{
        if(unpairedUser==socket.id){unpairedUser=null}
        socket.broadcast.to(rooms[socket.id]||socket.id).emit('opponentLeft')
    })
})
const PORT= process.env.PORT||3000
server.listen(PORT,()=>{console.log(`Server running on port ${PORT}`)})