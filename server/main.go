package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:1024,
	WriteBufferSize:1024,
}

type RoomManager struct{
	rooms map[string][]*websocket.Conn
	mu sync.Mutex
}

func NewRoomManager() *RoomManager{
	return &RoomManager{
		rooms: make(map[string][]*websocket.Conn),
	}
}

func (rm *RoomManager) JoinRoom(roomId string, conn *websocket.Conn){
	rm.mu.Lock()
	defer rm.mu.Unlock()
	rm.rooms[roomId] = append(rm.rooms[roomId], conn)
}

func (rm *RoomManager) BroadcaseToRoom(roomId string, messageType int, message []byte){
	rm.mu.Lock()
	defer rm.mu.Unlock()
	for _,conn:=range rm.rooms[roomId]{
		if err:= conn.WriteMessage(messageType,message); err!=nil{
			log.Println("Error broadcasting to room:", err)
		}
	}
}

func (rm *RoomManager) RemoveConnection(roomId string, conn *websocket.Conn){
	rm.mu.Lock()
	defer rm.mu.Unlock()
	connections := rm.rooms[roomId]
	for i,c := range connections{
		if c==conn{
			rm.rooms[roomId] = append(connections[:i],connections[i+1:]...)
			break;
		}
	}
	if len(rm.rooms[roomId])==0{
		delete(rm.rooms,roomId)
	}
}

var roomManager = NewRoomManager()

func homePage(w http.ResponseWriter, r *http.Request){
	fmt.Fprint(w,"Home Page")
}

func reader(roomId string,conn *websocket.Conn){
	defer func ()  {
		roomManager.RemoveConnection(roomId,conn)
		conn.Close()
	}()
	for{
		messageType,p,err := conn.ReadMessage()
		if(err!=nil){
			log.Println(err)
			return
		}
		fmt.Println(string(p))
		if err:=conn.WriteMessage(messageType,p); err!=nil{
			log.Println(err)
			return
		}
		log.Printf("Received Message in Room %s: %s\n",roomId,string(p))
		roomManager.BroadcaseToRoom(roomId,messageType,p)
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request){
	// fmt.Fprint(w,"Hello World")
	upgrader.CheckOrigin = func(r *http.Request) bool {return true}

	roomId := r.URL.Query().Get("roomId")
	if roomId==""{
		http.Error(w,"room id required",http.StatusBadRequest)
		return
	}

	ws,err := upgrader.Upgrade(w,r,nil)

	if err!=nil{
		log.Println(err)
	}

	log.Printf("Client connected to room %s\n",roomId)
	roomManager.JoinRoom(roomId,ws)
	log.Println("Client Connected")

	reader(roomId,ws)
}

func setUpRoutes(){
	http.HandleFunc("/",homePage)
	http.HandleFunc("/ws",wsEndpoint)
}

func main(){
	fmt.Println("Hello World")
	setUpRoutes()
	log.Fatal(http.ListenAndServe(":8080",nil))
}