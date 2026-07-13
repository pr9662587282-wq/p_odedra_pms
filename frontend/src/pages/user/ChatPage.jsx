import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner'; // Add this import for toast notifications
import { Send, User as UserIcon, ChevronLeft, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import User_Sidebar from './UserSidebar';
import Sidebar_Admin from '../admin/Sidebar_Admin';

import { requestFcmToken, listenForegroundMessages } from '../../services/firebase';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const scrollRef = useRef(null);

  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  // online user here or not
  const [debugInfo, setDebugInfo] = useState([]);
  const addDebug = (msg) => {
    const time = new Date().toLocaleTimeString();
    setDebugInfo((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 15));
  };
  const [onlineUsers, setOnlineUsers] = useState([]);
  const token = localStorage.getItem('token');
  const cleanId = (idInput) => {
    if (!idInput || idInput === 'null' || idInput === 'undefined') return '';
    const val = typeof idInput === 'object' ? idInput._id || idInput.id || idInput : idInput;
    const str = String(val).replace(/["']/g, '').trim();
    return str === 'null' || str === 'undefined' ? '' : str;
  };

  // Initialize myId immediately from localStorage for faster isMe check
  const [myId, setMyId] = useState(() => cleanId(localStorage.getItem('userId')));
  const role = localStorage.getItem('role');
  const savedGroupId = localStorage.getItem('groupId');
  const isAdmin = role === 'admin';

  const isIdMe = (senderId) => {
    const sid = cleanId(senderId);
    const mid = cleanId(myId || localStorage.getItem('userId'));
    return sid !== '' && sid === mid;
  };

  ///////////////////

  const fetchCurrentProfile = async () => {
    try {
      if (!token) return;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profile = res.data.profile || {};
      const userObj = res.data.user || {};

      setCurrentUser({ ...userObj, ...profile });

      if (userObj._id) {
        const cleanedUserId = cleanId(userObj._id);
        setMyId(cleanedUserId);
        localStorage.setItem('userId', cleanedUserId); // Ensure localStorage is also clean
      }

      const effectiveGroupId =
        role === 'admin' ? 'all' : profile.groupId || userObj.groupId || savedGroupId || 'null';

      setCurrentGroupId(effectiveGroupId);

      getUsers(effectiveGroupId);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentProfile();
    }
  }, []);

  // ---------------- ADD THIS BLOCK HERE ----------------
  useEffect(() => {
    if (!myId || myId === 'null' || !token) return;

    // Register FCM token and save to backend — with full on-screen logging
    requestFcmToken().then(({ token: fcmToken, error }) => {
      if (error) {
        addDebug('❌ FCM error: ' + error);
        return;
      }
      if (fcmToken) {
        addDebug('✅ Token got: ' + fcmToken.substring(0, 18) + '...');
        axios
          .post(
            `${import.meta.env.VITE_API_URL}/fcm/save-token`,
            { token: fcmToken },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => addDebug('✅ Saved to DB. Total tokens: ' + res.data?.tokenCount))
          .catch((err) => addDebug('❌ Save failed: ' + (err.response?.data?.message || err.message)));
      }
    });

    // Foreground handler — desktop: in-app toast | mobile: OS notification bar (handled in firebase.js)
    listenForegroundMessages((payload) => {
      const title    = payload.notification?.title || 'New Message';
      const body     = payload.notification?.body  || 'You have a new message';
      const chatUrl  = payload.data?.url            || '/chat';
      const senderId = payload.data?.senderId       || '';

      addDebug('📩 Foreground msg: ' + title);

      const alreadyInChat =
        selectedUserRef.current &&
        cleanId(selectedUserRef.current._id) === cleanId(senderId);
      if (alreadyInChat) return;

      toast(title, {
        description: body,
        duration: 6000,
        style: {
          background: '#128C7E',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 16px',
          fontWeight: '600',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        },
        action: {
          label: '💬 Open',
          onClick: () => {
            if (senderId) {
              const found = users.find((u) => cleanId(u._id) === cleanId(senderId));
              if (found) { openChat(found); } else { window.location.href = chatUrl; }
            } else { window.location.href = chatUrl; }
          },
        },
        cancel: { label: '✕', onClick: () => {} },
      });
    });
  }, [myId, token]);

  // Test push button handler — call this from mobile browser to verify end-to-end
  const sendTestPush = async () => {
    addDebug('🧪 Sending test push...');
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/fcm/test-push`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addDebug(`🧪 Result: ✅${res.data.successCount} ❌${res.data.failureCount}`);
      if (res.data.details) {
        res.data.details.forEach((d) => {
          addDebug(`  token: ${d.token} → ${d.success ? '✅' : '❌ ' + d.error}`);
        });
      }
      toast('Test sent!', {
        description: `Success: ${res.data.successCount}, Failed: ${res.data.failureCount}`,
        duration: 5000,
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      addDebug('❌ Test push error: ' + msg);
      toast('Test push failed', { description: msg, duration: 5000 });
    }
  };
  // -------------------

  useEffect(() => {
    if (!currentGroupId || currentGroupId === 'undefined' || !token) return;

    getUsers(currentGroupId);

    const interval = setInterval(() => {
      getUsers(currentGroupId);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentGroupId, token]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const requestIdRef = useRef(0);
  const socketRef = useRef(null);

  // Keep track of active state using refs to access current values inside socket listeners
  // without triggering a socket reconnection every time they change.
  const selectedUserRef = useRef(null);
  const currentGroupIdRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);
  useEffect(() => {
    currentGroupIdRef.current = currentGroupId;
  }, [currentGroupId]);

  useEffect(() => {
    if (!myId || myId === 'null') return;
    socketRef.current = io(import.meta.env.VITE_API_URL);
    socketRef.current.emit('join', myId);

    socketRef.current.on('receive_message', (msg) => {
      const activeUser = selectedUserRef.current;
      if (
        activeUser &&
        (cleanId(msg.senderId) === cleanId(activeUser._id) ||
          cleanId(msg.receiverId) === cleanId(activeUser._id))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      if (currentGroupIdRef.current) getUsers(currentGroupIdRef.current);
    });

    socketRef.current.on('online_users', (ids) => {
      if (Array.isArray(ids)) {
        const cleanedIds = ids.map((id) => cleanId(id)).filter((id) => id !== '');
        setOnlineUsers(cleanedIds);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [myId]); // Only reconnect if the current user ID changes
  const fetchMessages = async (receiverId) => {
    const myRequestId = ++requestIdRef.current;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (myRequestId === requestIdRef.current && Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = async (targetUser) => {
    setSelectedUser(targetUser);
    setMessages([]); // user switch karte hi purana data turant clear
    await fetchMessages(targetUser._id);
  };
  const getUsers = async (groupId) => {
    try {
      if (!token || !groupId || groupId === 'undefined') return;

      // Map actual null/empty values to "null" string so the backend can route/query correctly
      const targetGroupId = isAdmin
        ? 'all'
        : !groupId || groupId === 'null' || groupId === 'undefined'
          ? 'null'
          : groupId;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/users/${targetGroupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'user-id': myId && myId !== 'null' ? String(myId) : '',
        },
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // If the server returns 404, it means no users were found for this group
        setUsers([]);
      } else {
        console.error('AxiosError fetching users:', err);
      }
    }
  };

  // ---------------- ADD THIS BLOCK HERE ----------------
  const urlChatOpenedRef = useRef(false);

  useEffect(() => {
    if (urlChatOpenedRef.current) return; // already open ho chuka, dobara mat chalao

    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('userId');
    if (targetId && users.length > 0) {
      const found = users.find((u) => cleanId(u._id) === cleanId(targetId));
      if (found) {
        openChat(found);
        urlChatOpenedRef.current = true; // mark as done

        // URL se ?userId= hata do taaki refresh pe dobara trigger na ho
        window.history.replaceState({}, '', '/chat');
      }
    }
  }, [users]);
  // -------------------------------------------------------

  // ---------------- ADD THIS BLOCK HERE ----------------

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() && !imageFile) return;
    if (!selectedUser) return;

    try {
      const formData = new FormData();
      formData.append('receiverId', selectedUser._id);
      formData.append('message', message.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat/send`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        const newMsg = {
          ...res.data,
          senderId: res.data.senderId || myId,
        };
        socketRef.current.emit('sendMessage', newMsg);
        setMessages((prev) => [...prev, newMsg]);
        setMessage('');
        setImageFile(null);
        setImagePreview(null);
        if (currentGroupId) getUsers(currentGroupId);
      }
    } catch (err) {
      console.error('Failed to send message. Server says:', err.response?.data || err.message);
      if (err.response?.status === 500) {
        console.error('Check your Node.js console for the full stack trace!');
      }
    }
  };

  // Categorize users for "Grouping Data" view
  const getCategorizedUsers = () => {
    const filtered = users.filter((u) => u && !isIdMe(u._id));

    const categories = {};  

    if (currentGroupId === 'all') {
      // Admin View: Group users by their actual groupId field
      filtered.forEach((u) => {
        const groupName = u.groupId || 'Ungrouped Users';
        if (!categories[groupName]) categories[groupName] = [];
        categories[groupName].push(u);
      });
    } else {
      // Standard User View: Categorize by Group Members vs Others
      const members = [];
      const admins = [];
      const others = [];

      filtered.forEach((u) => {
        const isMember =
          u.groupId === currentGroupId ||
          (!u.groupId &&
            (!currentGroupId || currentGroupId === 'null' || currentGroupId === 'undefined'));
        if (isMember) {
          members.push(u);
        } else if (u.role === 'admin') {
          admins.push(u);
        } else {
          others.push(u);
        }
      });

      if (members.length > 0) categories['Group Members'] = members;
      if (admins.length > 0) categories['Administrators'] = admins;
      if (others.length > 0) categories['Other Conversations'] = others;
    }

    return categories;
  };

  const categorized = getCategorizedUsers();
  const hasUsers = users.filter((u) => u && !isIdMe(u._id)).length > 0;

  const renderUserItem = (u) => (
    <button
      key={u._id}
      onClick={() => openChat(u)}
      className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all ${
        String(selectedUser?._id) === String(u._id)
          ? 'bg-indigo-50/80 dark:bg-indigo-600/15 ring-1 ring-indigo-100 dark:ring-indigo-500/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
      }`}
    >
      <div className="relative shrink-0 group">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-950 dark:to-indigo-900/60 flex items-center justify-center ring-1 ring-indigo-200/50 dark:ring-indigo-500/20">
          <UserIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        {/* The Green Dot Indicator */}
        <span
          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#0B0F19] ${
            onlineUsers.some((oid) => oid === cleanId(u._id))
              ? 'bg-emerald-500'
              : 'bg-slate-300 dark:bg-slate-700'
          }`}
        ></span>
        {u.lastMessage &&
          !isIdMe(u.lastMessage.senderId) &&
          (!selectedUser || String(selectedUser._id) !== String(u._id)) && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-[#0B0F19] animate-bounce"></span>
          )}
      </div>
      <div className="text-left overflow-hidden flex-1">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
            {u.fullname ||
              u.fullName ||
              u.name ||
              (u.email ? u.email.split('@')[0] : 'Team Member')}

            {/* only name show no email {(u.fullname && !u.fullname.includes("@") && u.fullname) ||
              (u.fullName && !u.fullName.includes("@") && u.fu  llName) ||
              (u.name && !u.name.includes("@") && u.name) ||
              "Team Member"}*/}
          </p>
          {u.lastMessage && (
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
              {new Date(u.lastMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <p
            className={`text-xs truncate ${u.lastMessage && !isIdMe(u.lastMessage.senderId) && (!selectedUser || String(selectedUser._id) !== String(u._id)) ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 font-medium'}`}
          >
            {u.lastMessage ? (
              <>
                {isIdMe(u.lastMessage.senderId) ? 'You: ' : ''}
                {u.lastMessage.text}
              </>
            ) : (
              'Tap to chat'
            )}
          </p>
        </div>
      </div>
    </button>
  );

  return (
    <div
      className={`flex min-h-screen ${theme === 'dark' ? 'bg-[#090D16] text-white' : 'bg-slate-50 text-slate-900'}`}
    >
      <style>
        {`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}
      </style>
      {isAdmin ? (
        <Sidebar_Admin />
      ) : (
        <User_Sidebar
          fullName={
            currentUser?.fullname ||
            currentUser?.fullName ||
            currentUser?.name ||
            (currentUser?.email ? currentUser.email.split('@')[0] : 'Me')
          }
        />
      )}

      <main className="flex-1 md:ml-72 flex flex-col h-screen pt-16 md:pt-0">
        <div className="flex flex-1 overflow-hidden">
          {/* User List Sidebar */}
          <div
            className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800/60 flex flex-col bg-white dark:bg-[#0B0F19] ${selectedUser ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/60">
              <h2 className="text-lg font-black tracking-tight uppercase text-indigo-500 dark:text-indigo-400">
                Messages
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Group:{' '}
                {!currentUser?.groupId || currentUser?.groupId === 'null'
                  ? 'Public / Ungrouped'
                  : currentUser.groupId}
              </p>
              {/* Debug: test push button — remove after confirming push works */}
              <button
                onClick={sendTestPush}
                className="mt-2 text-[10px] px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
              >
                🧪 Test Push
              </button>
            </div>

            {/* ── On-screen Debug Panel (no DevTools needed) ── */}
            {debugInfo.length > 0 && (
              <div className="mx-2 mt-2 mb-1 rounded-xl bg-black/80 text-green-400 font-mono text-[10px] p-2 max-h-40 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-yellow-400 font-bold">🔍 FCM Debug</span>
                  <button
                    onClick={() => setDebugInfo([])}
                    className="text-red-400 hover:text-red-300 text-[9px]"
                  >
                    Clear
                  </button>
                </div>
                {debugInfo.map((line, i) => (
                  <div key={i} className="leading-relaxed break-all">{line}</div>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="p-2 space-y-1">
                {hasUsers ? (
                  Object.entries(categorized).map(([groupTitle, userList]) => (
                    <div key={groupTitle} className="mb-4">
                      <p className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/30 mb-1">
                        {groupTitle}
                      </p>
                      <div className="space-y-1">{userList.map(renderUserItem)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                    <p className="text-xs font-bold uppercase tracking-widest">
                      No other users in your group
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Wind ow */}
          <div
            className={`flex-1 flex flex-col bg-slate-50/30 dark:bg-[#080B11] ${selectedUser ? 'flex' : 'hidden md:flex'}`}
          >
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0B0F19]/90 dark:backdrop-blur-md flex items-center gap-3 md:gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                  >
                    <ChevronLeft size={20} />
                  </Button>

                  <div className="h-10 w-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/10 dark:shadow-none">
                    {selectedUser &&
                      (
                        selectedUser.fullname ||
                        selectedUser.fullName ||
                        selectedUser.name ||
                        selectedUser.email ||
                        'U'
                      )
                        .charAt(0)
                        .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                      {selectedUser?.fullname ||
                        selectedUser.fullName ||
                        selectedUser.name ||
                        selectedUser?.email}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          onlineUsers.some((oid) => oid === cleanId(selectedUser._id))
                            ? 'bg-emerald-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {onlineUsers.some((oid) => oid === cleanId(selectedUser._id))
                          ? 'Online'
                          : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages Area — Using a direct div for more reliable scrolling */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col space-y-4 no-scrollbar bg-slate-50/20 dark:bg-[#090D16]/40">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 opacity-60">
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        No messages yet
                      </p>
                      <p className="text-[10px]">Say hi to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      if (!msg) return null;

                      const isMe = isIdMe(msg.senderId || msg.sender);
                      return (
                        <div
                          key={msg._id || i}
                          className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`relative max-w-[85%] md:max-w-[75%] lg:max-w-[65%] px-4 py-2.5 rounded-2xl text-[13.5px] font-medium shadow-sm transition-all ${
                              isMe
                                ? 'bg-indigo-600 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-600 text-white rounded-tr-none shadow-indigo-500/10 dark:shadow-indigo-950/40'
                                : 'bg-white dark:bg-[#1E293B]/70 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800/40 shadow-sm'
                            }`}
                          >
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="sent"
                                className="rounded-xl max-w-[220px] mb-1.5 cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() =>
                                  window.open(`http://localhost:5000${msg.imageUrl}`, '_blank')
                                }
                              />
                            )}
                            {msg.message && (
                              <p className="leading-relaxed whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                            )}
                            <p
                              className={`text-[9px] mt-1 text-right font-black uppercase tracking-widest opacity-60 ${
                                isMe ? 'text-indigo-200/90' : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-[#0B0F19] border-t border-slate-200 dark:border-slate-800/60">
                  {imagePreview && (
                    <div className="relative inline-block mb-3">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="h-20 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-rose-500 dark:bg-rose-600 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-rose-600 transition-colors shadow"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-[#1E293B]/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1E293B] transition-colors p-0"
                    >
                      <ImageIcon size={20} />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 h-12 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/40 border-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-0 transition-all"
                    />
                    <Button
                      type="submit"
                      className="h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none p-0"
                    >
                      <Send size={20} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-[#080B11]/30">
                <div className="h-20 w-20 rounded-[2.5rem] bg-slate-100 dark:bg-[#1E293B]/40 flex items-center justify-center mb-4 ring-1 ring-slate-200/50 dark:ring-slate-800/30">
                  <Send size={32} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-slate-600 dark:text-slate-300">
                  Your Messages
                </h3>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Select a team member to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
