import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"

type StatusCallback = (videoTs: number, videoUrl: string, isPlaying: boolean, ts: string) => void;
type SeekCallback = (videoTs: number, ts: string) => void;
type PlayStateCallback = (isPlaying: boolean, ts: string) => void;

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private con: signalR.HubConnection

  constructor() { }

  public connectClient(onGetStateCallback:StatusCallback, onStatusCallback: StatusCallback, onSeekCallback: SeekCallback, onPlayStateUpdate: PlayStateCallback): void {
    this.con = new signalR.HubConnectionBuilder()
      .withUrl("/videoHub")
      .build();

    this.con.on("getState", (videoTs: number, videoUrl: string, isPlaying: boolean, ts: string) => {
      onGetStateCallback(videoTs, videoUrl, isPlaying, ts);
    });

    this.con.on("currentStatus", (videoTs: number, videoUrl: string, isPlaying: boolean, ts: string) => {
      onStatusCallback(videoTs, videoUrl, isPlaying, ts);
    });

    this.con.on("seek", (videoTs: number, ts: string) => {
      onSeekCallback(videoTs, ts);
    });

    this.con.on("playState", (isPlaying: boolean, ts: string) => {
      onPlayStateUpdate(isPlaying, ts);
    });

    this.con.start()
      .then(() => {
        console.log("Video Hub connection established");
        this.getCurrentState();
      })
      .catch((err: any) => console.log("Error while establishing Video hub connection ", err))
  }

  public getCurrentState(): void {
    this.con.send("getCurrentState")
      .catch((err: any) => console.log("Error getting current state ", err));
  }

  public updateState(videoTs: number, videoUrl: string, isPlaying: boolean, ts: string): void {
    this.con.send("updateState", videoTs, videoUrl, isPlaying, ts)
      .catch((err: any) => console.log("Error updating state ", err));
  }

  public seekTo(videoTs: number, ts: string): void {
    this.con.send("seekTo", videoTs, ts)
      .catch((err: any) => console.log("Error sending seek to", err));
  }

  public updatePlayState(isPlaying: boolean, ts: string): void {
    this.con.send("updatePlayState", isPlaying, ts)
      .catch((err: any) => console.log("Error sending play state", err));
  }
}
