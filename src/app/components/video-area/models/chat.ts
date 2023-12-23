export interface Comment {
  createdAt: string;
  commenter: Commenter;
  messageContent: string;
}

export interface Commenter {
  displayName: string;
  userColor: string;
}

export interface MessageContent {
  body: string;
}



