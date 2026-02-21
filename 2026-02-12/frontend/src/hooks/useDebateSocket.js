import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useDebateSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [debate, setDebate] = useState(null);
  const [debateArguments, setDebateArguments] = useState([]);
  const [thinking, setThinking] = useState(null);
  const [debateComplete, setDebateComplete] = useState(false);

  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Connected to debate server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from debate server');
      setConnected(false);
    });

    newSocket.on('debate:started', (data) => {
      console.log('Debate started:', data);
      setDebate(data);
      setDebateArguments([]);
      setDebateComplete(false);
    });

    newSocket.on('debate:thinking', (data) => {
      console.log('Model thinking:', data);
      setThinking(data);
    });

    newSocket.on('debate:argument', (data) => {
      console.log('New argument:', data);
      setThinking(null);
      setDebateArguments(prev => [...prev, data]);
    });

    newSocket.on('debate:complete', (data) => {
      console.log('Debate complete:', data);
      setThinking(null);
      setDebateComplete(true);
    });

    newSocket.on('vote:update', (data) => {
      console.log('Vote update:', data);
      setDebateArguments(prev => prev.map(arg => 
        arg.id === data.argumentId 
          ? { ...arg, votes: data.votes }
          : arg
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Auto-join debate room when debate starts
  useEffect(() => {
    if (socket && connected && debate?.debateId) {
      socket.emit('join-debate', debate.debateId);
      return () => {
        socket.emit('leave-debate', debate.debateId);
      };
    }
  }, [socket, connected, debate?.debateId]);

  const startDebate = useCallback((topic, models) => {
    if (socket && connected) {
      socket.emit('debate:start', { topic, models });
    }
  }, [socket, connected]);

  const vote = useCallback((argumentId, voteType) => {
    if (socket && connected) {
      socket.emit('vote', { argumentId, voteType });
    }
  }, [socket, connected]);

  return {
    connected,
    debate,
    arguments: debateArguments,
    thinking,
    debateComplete,
    startDebate,
    vote
  };
};
