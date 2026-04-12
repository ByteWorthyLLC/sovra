package socketio

import (
	"log"

	"github.com/zishang520/socket.io/v2/socket"
)

// HandleConnection sets up event handlers for a connected Socket.IO client.
func HandleConnection(io *socket.Server, client *socket.Socket) {
	client.On("workspace:join", func(args ...any) {
		if len(args) < 2 {
			log.Printf("workspace:join missing args (need tenantId, workspaceId)")
			return
		}
		tenantId, ok1 := args[0].(string)
		workspaceId, ok2 := args[1].(string)
		if !ok1 || !ok2 || tenantId == "" || workspaceId == "" {
			log.Printf("workspace:join invalid args: tenantId=%v workspaceId=%v", args[0], args[1])
			return
		}
		room := BuildRoomName(tenantId, workspaceId)
		client.Join(socket.Room(room))
		client.Emit("workspace:joined", room)
		log.Printf("client %s joined room %s", client.Id(), room)
	})

	client.On("workspace:leave", func(args ...any) {
		if len(args) < 2 {
			return
		}
		tenantId, ok1 := args[0].(string)
		workspaceId, ok2 := args[1].(string)
		if !ok1 || !ok2 {
			return
		}
		room := BuildRoomName(tenantId, workspaceId)
		client.Leave(socket.Room(room))
		log.Printf("client %s left room %s", client.Id(), room)
	})

	client.On("disconnect", func(...any) {
		log.Printf("client %s disconnected", client.Id())
	})
}
