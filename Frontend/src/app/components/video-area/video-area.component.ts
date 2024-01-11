import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { NgClass, NgFor, NgIf } from "@angular/common";
import {ActivatedRoute, Router} from '@angular/router';
import {interval, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Comment} from './models/chat';
import {LoadSpinnerComponent} from "../load-spinner/load-spinner.component";
import videojs from 'video.js';
import Player from 'video.js/dist/types/player'
import {ChatService} from "./services/chat.service";
import {FormsModule} from "@angular/forms";
import {VideoService} from "./services/video.service";


@Component({
  selector: 'app-video-area',
  templateUrl: './video-area.component.html',
  standalone: true,
  styleUrls: ['./video-area.component.scss'],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    LoadSpinnerComponent,
    FormsModule
  ]
})
export class VideoAreaComponent implements OnInit, OnDestroy, AfterViewInit {

  public loadingVodData = false;
  public chatInput: string;

  @ViewChild('player') player: any;

  @ViewChild('messageList', {static: false}) messageList: ElementRef;
  @ViewChildren('messages') messages: QueryList<any>;

  public viewChat: Comment[] = [];

  @ViewChild('jsPlayer', {static: false}) jsPlayerRef: ElementRef;
  private jsPlayer: Player;

  private playerReady = false;

  private destroy$  = new Subject();
  private scrollMessageList: any;
  private syncing = true;
  private videoUrl = "https://cdn.argonautdev.ch/file/bf88315b-9cf4-45b9-9490-2b15517b00e0.mp4";

  readonly MAX_TOL_S = 1.5;

  constructor(
    private chatService: ChatService,
    private videoService: VideoService,
    private changeDetection: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.scrollMessageList = this.messageList.nativeElement;
    this.messages.changes.subscribe(_ => this.onMessageListChanged());
    let username = prompt("Enter username");
    if (username == null || username == "") username = "default";
    this.chatService.connectClient(username, (name: string, message: string) => {
      this.onChatMessage(name, message);
    });
    this.viewChat.push(this.createSystemMessage("Connected to chat as " + username));

    this.setupJsPlayer(() => {
      this.onPlayerReady();
    });
  }

  private onPlayerReady(): void {
    this.jsPlayer.play();
    this.videoService.connectClient((videoTs: number, videoUrl: string, ts: string) => {
      this.onVideoState(videoTs, videoUrl, ts);
    }, (videoTs: number, ts: string) => {
      this.onSeek(videoTs, ts);
    });

    // Update cycle
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(x => {
        console.log("Update state");
        if (this.syncing) return;
        let currPlayerTime = this.getPlayerTime();
        let ts = new Date().toISOString();
        console.log("Update state with", currPlayerTime, this.videoUrl, ts);
        this.videoService.updateState(currPlayerTime, this.videoUrl, ts);
      });

  }

  public pressEnterOnChatBox(): void {
    if (this.chatInput == null || this.chatInput == "") {
      return;
    }
    console.log("Sending message ", this.chatInput);
    this.chatService.sendMessage(this.chatInput);
    this.chatInput = "";
  }

  private onVideoState(videoTs: number, videoUrl: string, ts: string)
  {
    console.log("On video state", videoTs, videoUrl, ts);
    // TODO: Properly implement
    let currTs = this.getPlayerTime();
    if (Math.abs(currTs - videoTs) <= this.MAX_TOL_S && !this.syncing) return;
    if (this.syncing) {
      console.log("Finished initial syncing");
      this.playerSeekTo(videoTs);
      this.syncing = false;
    }
  }

  private onSeek(videoTs: number, ts: string): void {
    console.log("On seek", videoTs, ts);
    // TODO: properly implement
    this.playerSeekTo(videoTs);
  }

  private onChatMessage(username: string, message: string): void {
    console.log(`Received message from ${username} with content ${message}`)
    this.viewChat.push({
      commenter: {
        displayName: username,
        userColor: '#00CAFDFF',
      },
      messageContent: message
    });
    this.changeDetection.detectChanges();
  }

  private setupJsPlayer(onReadyCallback: any): void {
    // use custom videojs player to view m3u8 files
    console.log("Setting up player");
    const options = {
      fluid: false,
      aspectRatio: '16:9',
      autoplay: true,
      controls: true,
      sources: [
        {
          src: this.videoUrl,
          type: 'video/mp4',
        }
      ]
    };

    this.jsPlayer = videojs(
      this.jsPlayerRef.nativeElement,
      {
        ...options,
        preload: 'auto',
        userActions: {
          doubleClick: true,
          hotkeys(event: any): void {
            // @ts-ignore
            const p: Player = this;
            // Arrow left
            if (event.which === 37) {
              const curr = p.currentTime() ?? 0;
              p.currentTime(Math.max(0, curr - 5));
            }

            // Arrow right
            if (event.which === 39) {
              const curr = p.currentTime() ?? 0;
              const vidLength = p.duration() ?? 0;
              p.currentTime(Math.min(vidLength, curr + 5));
            }

            // spacebar
            if (event.which === 32) {
              if (p.paused()) {
                p.play();
              } else {
                p.pause();
              }
            }
          }
        }
      },
      () => {
        console.log("Player Ready!");
        this.playerReady = true;
        this.loadingVodData = false;
        onReadyCallback();
      }
    );
  }

  private clearChat(): void {
    this.viewChat = [];
    this.viewChat.push(this.createSystemMessage('Loading Chat. Hang tight :)'));
  }

  private createSystemMessage(message: string): Comment {
    return {
      commenter: {
        displayName: 'System',
        userColor: '#808080',
      },
      messageContent: message,
    };
  }

  private getPlayerTime(): number {
    return this.jsPlayer.currentTime() ?? 0;
  }

  private playerSeekTo(seconds: number): void {
    this.jsPlayer.currentTime(seconds);
  }

  private isPlayerPaused(): boolean {
    return this.jsPlayer.paused();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
  }

  private onMessageListChanged(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    this.scrollMessageList.scroll({
      top: this.scrollMessageList.scrollHeight,
      left: 0,
      behavior: 'auto'
    });
  }

}
