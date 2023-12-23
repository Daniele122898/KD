import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ChatReply} from '../models/friendsChat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  public getChatBatch(vodId: string, startOffset: number, endOffset: number): Observable<ChatReply[]> {
    const params = new HttpParams()
      .set('start', startOffset.toString())
      .set('end', endOffset.toString());

    return this.http.get<ChatReply[]>(this.baseUrl + 'chat/video/' + vodId, { params });
  }

}
