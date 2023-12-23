import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"

type CallbackFunc = (username: string, message: string) => void;

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private username = "default";
  private con: signalR.HubConnection

  constructor() { }

  public connectClient(username: string, onChatMessage: CallbackFunc): void {
    this.username = username
    this.con = new signalR.HubConnectionBuilder()
      .withUrl("/chatHub")
      .build();

    this.con.on("messageReceived", (username: string, message: string) => {
      onChatMessage(username, message);
    });

    this.con.start()
      .then(() => console.log("Chat Hub connection established"))
      .catch((err: any) => console.log("Error while establishing Chat hub connection ", err))
  }

  public sendMessage(message: string): void {
    this.con.send("newMessage", this.username, message)
      .catch((err: any) => console.log("Error sending message ", err));
  }
}
