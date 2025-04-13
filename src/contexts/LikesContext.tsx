import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as signalR from '../api/signalR';
import * as likesApi from '../api/likes';

interface LikesContextType {
  likesCount: Record<string, number>;
  likedStatus: Record<string, boolean>;
  updateLikesCount: (templateId: string, count: number) => void;
  updateLikeStatus: (templateId: string, liked: boolean) => void;
  initializeTemplate: (templateId: string, isAuthenticated: boolean) => void;
}

const defaultContext: LikesContextType = {
  likesCount: {},
  likedStatus: {},
  updateLikesCount: () => {},
  updateLikeStatus: () => {},
  initializeTemplate: () => {}
};

const LikesContext = createContext<LikesContextType>(defaultContext);

export const useLikes = () => useContext(LikesContext);

interface LikesProviderProps {
  children: ReactNode;
}

export const LikesProvider: React.FC<LikesProviderProps> = ({ children }) => {
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [likedStatus, setLikedStatus] = useState<Record<string, boolean>>({});
  const [initializedTemplates, setInitializedTemplates] = useState<Set<string>>(new Set());
  const [signalRConnected, setSignalRConnected] = useState(false);

  useEffect(() => {
    const setupSignalR = async () => {
      try {
        const success = await signalR.startConnection();
        
        if (success) {
          setSignalRConnected(true);
          
          signalR.onUpdateLikes((count: number, templateId: string) => {
            if (templateId) {
              setLikesCount(prev => ({
                ...prev,
                [templateId]: count
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error setting up SignalR in LikesContext:', error);
      }
    };
    
    setupSignalR();
    
    return () => {
      signalR.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (signalRConnected && initializedTemplates.size > 0) {
      const joinGroups = async () => {
        const templatesArray = Array.from(initializedTemplates);
        for (const templateId of templatesArray) {
          try {
            await signalR.joinTemplateGroup(templateId);
          } catch (err) {
            console.error(`Error joining template group ${templateId}:`, err);
          }
        }
      };
      
      joinGroups();
    }
  }, [signalRConnected, initializedTemplates]);

  const updateLikesCount = useCallback((templateId: string, count: number) => {
    setLikesCount(prev => {
      if (prev[templateId] !== count) {
        return { ...prev, [templateId]: count };
      }
      return prev;
    });
  }, []);

  const updateLikeStatus = useCallback((templateId: string, liked: boolean) => {
    setLikedStatus(prev => {
      if (prev[templateId] !== liked) {
        return { ...prev, [templateId]: liked };
      }
      return prev;
    });
  }, []);

  const pendingFetches = React.useRef<Record<string, boolean>>({});

  const initializeTemplate = useCallback(async (templateId: string, isAuthenticated: boolean) => {
    if (initializedTemplates.has(templateId) || pendingFetches.current[templateId]) {
      return;
    }
    
    pendingFetches.current[templateId] = true;
    
    try {
      if (likesCount[templateId] === undefined) {
        const count = await likesApi.getLikesCount(templateId);
        updateLikesCount(templateId, count);
      }
      
      if (isAuthenticated && likedStatus[templateId] === undefined) {
        const hasLiked = await likesApi.getLikeStatus(templateId);
        updateLikeStatus(templateId, hasLiked);
      }
      
      setInitializedTemplates(prev => {
        const newSet = new Set(prev);
        newSet.add(templateId);
        return newSet;
      });
      
      if (signalRConnected) {
        await signalR.joinTemplateGroup(templateId);
      }
    } catch (error) {
      console.error(`Error initializing template ${templateId}:`, error);
    } finally {
      pendingFetches.current[templateId] = false;
    }
  }, [initializedTemplates, likesCount, likedStatus, signalRConnected, updateLikesCount, updateLikeStatus]);

  const contextValue: LikesContextType = {
    likesCount,
    likedStatus,
    updateLikesCount,
    updateLikeStatus,
    initializeTemplate
  };
  
  return (
    <LikesContext.Provider value={contextValue}>
      {children}
    </LikesContext.Provider>
  );
};

export default LikesContext;