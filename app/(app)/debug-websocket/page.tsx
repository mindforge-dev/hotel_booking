"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/providers/webSocketProvider';
import { useNotifications } from '@/hooks/dashboard/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugWebSocketPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState("Test notification from debug page");

  const { isConnected, connectionState, sendNotification } = useWebSocket();
  const { data: notifications = [], isLoading, refetch } = useNotifications(session?.user?.id || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    addLog(`WebSocket connection state: ${connectionState}`);
  }, [connectionState]);

  useEffect(() => {
    addLog(`Notifications count: ${notifications.length}`);
  }, [notifications.length]);

  const testDirectWebSocket = () => {
    addLog("Testing direct WebSocket connection...");
    
    const ws = new WebSocket('wss://kkxol6k0v8.execute-api.ap-southeast-1.amazonaws.com/dev/?userId=cmcpy3knp0000707m5wcncri2');
    
    ws.onopen = () => {
      addLog("✅ Direct WebSocket connected");
      
      // Send test message
      const message = {
        action: 'sendNotification',
        userId: 'cmcpy3knp0000707m5wcncri2',
        message: 'Direct WebSocket test message'
      };
      
      ws.send(JSON.stringify(message));
      addLog("📤 Sent direct WebSocket message");
      
      // Close after 2 seconds
      setTimeout(() => {
        ws.close();
        addLog("🔌 Closed direct WebSocket");
      }, 2000);
    };
    
    ws.onmessage = (event) => {
      addLog(`📩 Direct WebSocket received: ${event.data}`);
    };
    
    ws.onerror = (error) => {
      addLog(`❌ Direct WebSocket error: ${error}`);
    };
  };

  const testAPICall = async () => {
    addLog("Testing API call...");
    
    try {
      const response = await fetch('/api/websocket/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          userId: 'cmcpy3knp0000707m5wcncri2'
        })
      });
      
      const result = await response.json();
      addLog(`✅ API call result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`❌ API call error: ${error}`);
    }
  };

  const testProviderWebSocket = () => {
    addLog("Testing WebSocket provider...");
    
    if (isConnected) {
      sendNotification({
        action: 'sendNotification',
        userId: session?.user?.id,
        message: 'Test from WebSocket provider'
      });
      addLog("📤 Sent message via WebSocket provider");
    } else {
      addLog("❌ WebSocket provider not connected");
    }
  };

  const refreshNotifications = async () => {
    addLog("Refreshing notifications...");
    await refetch();
    addLog("✅ Notifications refreshed");
  };

  if (!session) {
    return <div className="p-8">Please log in to test WebSocket functionality.</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">WebSocket Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>User ID: <code className="bg-gray-100 px-2 py-1 rounded">{session.user?.id}</code></div>
            <div>WebSocket Connected: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{isConnected ? 'Yes' : 'No'}</span></div>
            <div>Connection State: <code className="bg-gray-100 px-2 py-1 rounded">{connectionState}</code></div>
            <div>Notifications Count: <span className="font-bold">{notifications.length}</span></div>
            <div>Unread Count: <span className="font-bold">{notifications.filter(n => !n.isRead).length}</span></div>
            <div>Loading: <span className={isLoading ? 'text-yellow-600' : 'text-green-600'}>{isLoading ? 'Yes' : 'No'}</span></div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Test message"
              />
            </div>
            
            <div className="space-y-2">
              <Button onClick={testDirectWebSocket} className="w-full">
                Test Direct WebSocket
              </Button>
              
              <Button onClick={testAPICall} className="w-full">
                Test API Call
              </Button>
              
              <Button onClick={testProviderWebSocket} className="w-full" disabled={!isConnected}>
                Test WebSocket Provider
              </Button>
              
              <Button onClick={refreshNotifications} className="w-full">
                Refresh Notifications
              </Button>
              
              <Button onClick={() => setLogs([])} variant="outline" className="w-full">
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-gray-500">No notifications</div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="p-3 border rounded">
                  <div className="font-medium">{notification.message}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()} | 
                    Read: {notification.isRead ? 'Yes' : 'No'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}