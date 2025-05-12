import * as signalR from '@microsoft/signalr';
import { Comment } from '../types';

const API_URL = 'https://customizableforms.runasp.net';
//const API_URL = 'https://localhost:7164';

class SignalRConnection {
  private static instance: SignalRConnection;
  private connection: signalR.HubConnection | null = null;
  private connectionPromise: Promise<signalR.HubConnection> | null = null;
  private activeGroups: Set<string> = new Set();
  private isConnecting: boolean = false;
  
  private constructor() {}
  
  public static getInstance(): SignalRConnection {
    if (!SignalRConnection.instance) {
      SignalRConnection.instance = new SignalRConnection();
    }
    return SignalRConnection.instance;
  }
  
  public async getConnection(): Promise<signalR.HubConnection> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return this.connection;
    }
      
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
     
    
    this.isConnecting = true;
    this.connectionPromise = new Promise<signalR.HubConnection>((resolve, reject) => {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/comments`)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .build();
      
      newConnection.onclose((error) => {
        this.connection = null;
        this.connectionPromise = null;
        this.isConnecting = false;
        
        if (this.activeGroups.size > 0) {
          setTimeout(() => {
            this.reconnectToGroups();
          }, 1000);
        }
      });

      newConnection.start()
        .then(() => {
          this.connection = newConnection;
          this.isConnecting = false;
          resolve(newConnection);
        })
        .catch(err => {
          console.error('Error starting SignalR connection:', err);
          this.connection = null;
          this.connectionPromise = null;
          this.isConnecting = false;
          reject(err);
        });
    });
    
    return this.connectionPromise;
  }
  
  public async joinTemplateGroup(templateId: string): Promise<boolean> {
    try {
      const conn = await this.getConnection();
      await conn.invoke('JoinTemplateGroup', templateId);
      this.activeGroups.add(templateId);
      return true;
    } catch (err) {
      console.error('Error joining template group:', err);
      return false;
    }
  }
  
  public async leaveTemplateGroup(templateId: string): Promise<boolean> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      this.activeGroups.delete(templateId);
      return true;
    }
    
    try {
      await this.connection.invoke('LeaveTemplateGroup', templateId);
      this.activeGroups.delete(templateId);
      return true;
    } catch (err) {
      console.error('Error leaving template group:', err);
      this.activeGroups.delete(templateId);
      return false;
    }
  }
  
  private async reconnectToGroups(): Promise<void> {
    if (this.activeGroups.size === 0) return;
    
    try {
      const conn = await this.getConnection();
      const groupsToReconnect = Array.from(this.activeGroups);
      
      for (const groupId of groupsToReconnect) {
        try {
          await conn.invoke('JoinTemplateGroup', groupId);
        } catch (groupErr) {
          console.error(`Failed to reconnect to group ${groupId}:`, groupErr);
        }
      }
    } catch (err) {
      console.error('Error reconnecting to groups:', err);
    }
  }
  
  public onReceiveComment(callback: (comment: Comment) => void): void {
    this.getConnection().then(conn => {
      conn.off('ReceiveComment');
      conn.on('ReceiveComment', callback);
    });
  }
  
  public onUpdateComment(callback: (comment: Comment) => void): void {
    this.getConnection().then(conn => {
      conn.off('UpdateComment');
      conn.on('UpdateComment', callback);
    });
  }
  
  public onDeleteComment(callback: (commentId: string) => void): void {
    this.getConnection().then(conn => {
      conn.off('DeleteComment');
      conn.on('DeleteComment', callback);
    });
  }
  
  public removeAllListeners(): void {
    if (!this.connection) return;
    
    this.connection.off('ReceiveComment');
    this.connection.off('UpdateComment');
    this.connection.off('DeleteComment');
    this.connection.off('UpdateLikes');
  }
  
  public async stopConnection(): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        const groupIds = Array.from(this.activeGroups);
        for (const groupId of groupIds) {
          try {
            await this.connection.invoke('LeaveTemplateGroup', groupId);
          } catch (groupErr) {
            console.error(`Error leaving group ${groupId} during shutdown:`, groupErr);
          }
        }
        
        this.activeGroups.clear();
        await this.connection.stop();
      } catch (err) {
        console.error('Error stopping SignalR connection:', err);
      } finally {
        this.connection = null;
        this.connectionPromise = null;
      }
    }
  }
}

const signalRInstance = SignalRConnection.getInstance();

export const startConnection = async (): Promise<boolean> => {
  try {
    await signalRInstance.getConnection();
    return true;
  } catch (err) {
    return false;
  }
};

export const stopConnection = async (): Promise<void> => {
  await signalRInstance.stopConnection();
};

export const joinTemplateGroup = async (templateId: string): Promise<boolean> => {
  return await signalRInstance.joinTemplateGroup(templateId);
};

export const leaveTemplateGroup = async (templateId: string): Promise<boolean> => {
  return await signalRInstance.leaveTemplateGroup(templateId);
};

export const onReceiveComment = (callback: (comment: Comment) => void): void => {
  signalRInstance.onReceiveComment(callback);
};

export const onUpdateComment = (callback: (comment: Comment) => void): void => {
  signalRInstance.onUpdateComment(callback);
};

export const onDeleteComment = (callback: (commentId: string) => void): void => {
  signalRInstance.onDeleteComment(callback);
};

export const removeAllListeners = (): void => {
  signalRInstance.removeAllListeners();
};