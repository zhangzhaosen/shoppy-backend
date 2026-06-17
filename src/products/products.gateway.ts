import { AuthService } from "@/auth/auth.service";
import { WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class ProductsGateway {

  constructor(private readonly authService: AuthService) { }
  @WebSocketServer()
  private readonly server: Server

  handleProductUpdated() {
    this.server.emit('productUpdated')
  }

  handleConnection(client: Socket) {
    try {

      const authentication = client.handshake.auth.Authentication
      console.log('handleConnection authentication', authentication)
      this.authService.verifyToken(authentication);

    }
    catch (e) {

       throw new WsException('Unauthorized error. Please login first.')
    }
  }
}