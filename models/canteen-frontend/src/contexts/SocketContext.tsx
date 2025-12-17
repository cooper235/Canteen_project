'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from '@/lib/config'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
})

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    console.log('🔌 SocketContext useEffect triggered')
    console.log('Session data:', session)
    console.log('Session user:', session?.user)
    console.log('Session user properties:', session?.user ? Object.keys(session.user) : 'no user')
    console.log('User ID:', session?.user?.id)
    
    // Only connect if user is authenticated
    if (!session?.user?.id) {
      console.log('❌ No session or user ID, skipping socket connection')
      return
    }

    console.log('✅ Initiating socket connection for user:', session.user.id)
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      console.log('Session user:', session.user)
      setIsConnected(true)

      // Join user's personal room for notifications
      if (session.user.id) {
        console.log('Joining user room:', session.user.id)
        newSocket.emit('join', session.user.id)
      } else {
        console.warn('No user ID in session, cannot join room')
      }

      // If user is canteen owner, join canteen room
      if (session.user.role === 'canteen_owner' && session.user.canteenId) {
        console.log('Joining canteen room:', session.user.canteenId)
        newSocket.emit('joinCanteen', session.user.canteenId)
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [session])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
