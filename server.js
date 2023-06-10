const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,

});

var nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    port:587,
    host:"smtp.gmail.com",
    auth:{
        user:'pranaygour3042007@gmail.com',
        pass:'eigwgmqgekwrdear'
    },
    secure:true,
})


app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post("/send-mail" , (req,res)=>{
    const to = req.body.to;
    const url = req.body.url;
    const maildata = {
        from:"pranaygour3042007@gmail.com",
        to:to,
        subject:"Join the Video chat with me",
        html:`<p>Hey There</p>
        <p>come and join with me for a video chat here - ${url}</p>`
    };
    transporter.sendMail(maildata,(error,info)=>{
        if(error){
            return console.log(error)
        }
        else{
            res.status(200).send({message:"Invitation sent" , message_id:info.messageId})
        }
    })

})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-conncted" , userId)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);