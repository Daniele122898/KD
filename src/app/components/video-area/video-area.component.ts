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


@Component({
  selector: 'app-video-area',
  templateUrl: './video-area.component.html',
  standalone: true,
  styleUrls: ['./video-area.component.scss'],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    LoadSpinnerComponent
  ]
})
export class VideoAreaComponent implements OnInit, OnDestroy, AfterViewInit {

  public loadingVodData = false;

  @ViewChild('player') player: any;

  @ViewChild('messageList', {static: false}) messageList: ElementRef;
  @ViewChildren('messages') messages: QueryList<any>;

  public viewChat: Comment[] = [];

  @ViewChild('jsPlayer', {static: false}) jsPlayerRef: ElementRef;
  private jsPlayer: Player;

  private playerReady = false;

  private destroy$  = new Subject();
  private scrollMessageList: any;

  constructor(
    // private chatService: ChatService,
    private changeDetection: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.scrollMessageList = this.messageList.nativeElement;
    this.messages.changes.subscribe(_ => this.onMessageListChanged());
    this.setupJsPlayer()
  }

  private setupJsPlayer(): void {
    // use custom videojs player to view m3u8 files
    console.log("Setting up player");
    const options = {
      fluid: false,
      aspectRatio: '16:9',
      autoplay: true,
      controls: true,
      sources: [
        {
          src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
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
      createdAt: Date.now().toString()
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
