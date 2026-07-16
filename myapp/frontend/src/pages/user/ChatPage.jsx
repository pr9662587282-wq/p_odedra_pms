import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner'; // Add this import for toast notifications

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import User_Sidebar from './UserSidebar';
import Sidebar_Admin from '../admin/Sidebar_Admin';

import { requestFcmToken, listenForegroundMessages } from '../../services/firebase';
import { Video, PhoneOff, Phone, Mic, MicOff, VideoOff } from 'lucide-react';

import {
  Send,
  User as UserIcon,
  ChevronLeft,
  Image as ImageIcon,
  X,
  Pencil,
  Trash2,
  Ban,
} from 'lucide-react';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const scrollRef = useRef(null);

  const { theme } = useTheme();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  // online user here or not
  const [onlineUsers, setOnlineUsers] = useState([]);
  // Track notification permission — 'granted' | 'denied' | 'default'
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const token = localStorage.getItem('token');

  // ---------------- MESSAGE SELECT / EDIT / DELETE STATE ----------------
  const [selectedMsg, setSelectedMsg] = useState(null); // msg picked for the action bar (Edit/Delete)
  const [editingMsg, setEditingMsg] = useState(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);
  const [typingUsers, setTypingUsers] = useState({});
  const sidebarTypingTimeoutsRef = useRef({}); // msg currently being edited in the input box
  const longPressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);
  const inputRef = useRef(null);

  const isTouchDevice =
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  //  video call const..............

  // ---------------- VIDEO CALL STATE ----------------
  const [incomingCall, setIncomingCall] = useState(null); // { fromUserId, fromName, offer }
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | ringing | in-call
  const [callPeerName, setCallPeerName] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const callPartnerIdRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  // chat rection.........................................................................
  const REACTION_EMOJIS = ['👍', '😂', '🔥', '😮', '🎉', '🙏'];

  const [reactionPickerMsg, setReactionPickerMsg] = useState(null);
  const [messageReactions, setMessageReactions] = useState({}); // { msgId: { '': [userId, ...] } }
  const lastTapRef = useRef({ id: null, time: 0 });
  // double clicking send reaction
  const openReactionPicker = (msg) => {
    if (msg.deleted) return;
    setReactionPickerMsg(msg);
  };

  // Desktop
  const handleMsgDoubleClick = (e, msg) => {
    e.stopPropagation();
    openReactionPicker(msg);
  };

  // Mobile — manual double-tap detection (runs inside your existing handleTouchEnd)
  const handleMsgTap = (msg) => {
    if (msg.deleted) return;
    const now = Date.now();
    if (lastTapRef.current.id === msg._id && now - lastTapRef.current.time < 300) {
      openReactionPicker(msg);
      lastTapRef.current = { id: null, time: 0 };
    } else {
      lastTapRef.current = { id: msg._id, time: now };
    }
  };
  const toggleReaction = async (msgId, emoji) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/chat/react/${msgId}`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socketRef.current?.emit('message_reaction', {
        messageId: msgId,
        emoji,
        userId: myId,
        action: res.data.action,
        toUserId: cleanId(selectedUser._id),
      });
    } catch (err) {
      console.error('Failed to save reaction:', err.response?.data || err.message);
    }
    setReactionPickerMsg(null);
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  const createPeerConnection = (remoteUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit('ice-candidate', {
          toUserId: remoteUserId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  // useeffect
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current || null;
    }
    if (!localStreamRef.current && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [callStatus]);

  // Caller: click the video icon
  const startCall = async (targetUser) => {
    try {
      callPartnerIdRef.current = cleanId(targetUser._id);
      setCallPeerName(targetUser.fullname || targetUser.fullName || targetUser.name || 'User');
      setCallStatus('calling');

      const stream = await getLocalStream();
      const pc = createPeerConnection(callPartnerIdRef.current);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.emit('call-user', {
        toUserId: callPartnerIdRef.current,
        fromUserId: myId,
        fromName: currentUser?.fullname || currentUser?.fullName || 'Someone',
        offer,
      });
    } catch (err) {
      console.error('Failed to start call:', err);
      toast('Camera/mic access needed to call');
      setCallStatus('idle');
    }
  };

  // Callee: accept the incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      callPartnerIdRef.current = cleanId(incomingCall.fromUserId);
      setCallPeerName(incomingCall.fromName || 'User');

      const stream = await getLocalStream();
      const pc = createPeerConnection(callPartnerIdRef.current);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      // flush any ICE candidates that arrived before remote description was set
      for (const c of pendingCandidatesRef.current) await pc.addIceCandidate(c);
      pendingCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current?.emit('call-answer', {
        toUserId: callPartnerIdRef.current,
        answer,
      });

      setIncomingCall(null);
      setCallStatus('in-call');
    } catch (err) {
      console.error('Failed to accept call:', err);
      setCallStatus('idle');
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socketRef.current?.emit('call-rejected', { toUserId: cleanId(incomingCall.fromUserId) });
    }
    setIncomingCall(null);
    setCallStatus('idle');
  };

  const endCall = () => {
    if (callPartnerIdRef.current) {
      socketRef.current?.emit('call-ended', { toUserId: callPartnerIdRef.current });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pendingCandidatesRef.current = [];
    callPartnerIdRef.current = null;
    setCallStatus('idle');
    setIncomingCall(null);
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()?.[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()?.[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };
  ////////////////////////////////

  // Desktop: a plain click selects the message (shows action bar).

  const handleMsgClick = (msg) => {
    if (msg.deleted) return;
    setSelectedMsg((prev) => (prev && prev._id === msg._id ? null : msg));
  };
  // Mobile: press-and-hold selects the message.
  const handleTouchStart = (msg) => {
    if (msg.deleted) return;
    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      setSelectedMsg(msg);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 450);
  };
  const handleTouchEnd = (msg) => {
    clearTimeout(longPressTimerRef.current);
    if (!longPressFiredRef.current) {
      handleMsgTap(msg);
    }
  };
  const handleTouchMove = () => {
    clearTimeout(longPressTimerRef.current);
  };

  const clearSelection = () => setSelectedMsg(null);

  const startEdit = () => {
    if (!selectedMsg || selectedMsg.deleted) return;
    setEditingMsg(selectedMsg);
    setMessage(selectedMsg.message || '');
    setImageFile(null); // no new file selected
    // Show the existing image as a preview so the user sees what they're captioning
    setImagePreview(
      selectedMsg.imageUrl ? `${import.meta.env.VITE_API_URL}${selectedMsg.imageUrl}` : null
    );
    setSelectedMsg(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const cancelEdit = () => {
    setEditingMsg(null);
    setMessage('');
  };

  const deleteSelectedMsg = async () => {
    if (!selectedMsg) return;
    const targetId = selectedMsg._id;
    setSelectedMsg(null);

    setMessages((prev) =>
      prev.map((m) =>
        m._id === targetId ? { ...m, deleted: true, message: '', imageUrl: null } : m
      )
    );

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/chat/delete/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to delete message:', err.response?.data || err.message);
      toast('Could not delete message', { description: 'Please try again.' });
      if (selectedUser) fetchMessages(selectedUser._id);
    }
  };
  // ------------------------------------------------------------------------
  const cleanId = (idInput) => {
    if (!idInput || idInput === 'null' || idInput === 'undefined') return '';
    const val = typeof idInput === 'object' ? idInput._id || idInput.id || idInput : idInput;
    const str = String(val).replace(/["']/g, '').trim();
    return str === 'null' || str === 'undefined' ? '' : str;
  };
  const resolveUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
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
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = res.data.profile || {};
      const userObj = res.data.user || {};

      setCurrentUser({ ...userObj, ...profile });

      if (userObj._id) {
        const cleanedUserId = cleanId(userObj._id);

        // ── Agar is device pe pehle koi doosra user logged in tha, ──
        // ── toh purana service worker/token clear karke naya banayein ──
        const lastLoggedInUser = localStorage.getItem('lastFcmUserId');
        if (lastLoggedInUser && lastLoggedInUser !== cleanedUserId) {
          console.log('🔄 Different user detected on this device — refreshing FCM token');
          try {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const reg of regs) await reg.unregister();
          } catch (e) {
            console.error('SW cleanup failed:', e);
          }
          fcmRegisteredRef.current = false;
        }
        localStorage.setItem('lastFcmUserId', cleanedUserId);

        setMyId(cleanedUserId);
        localStorage.setItem('userId', cleanedUserId);
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

  const fcmRegisteredRef = useRef(false);

  // ── Register FCM token — called on load if already granted, or on button click ──
  const registerFcmToken = async () => {
    try {
      const { token: fcmToken, error } = await requestFcmToken();
      if (error || !fcmToken) {
        console.warn('FCM token not obtained:', error);
        return;
      }
      setNotifPermission('granted');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/fcm/save-token`,
        { token: fcmToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ FCM token saved, total:', res.data?.tokenCount);
      fcmRegisteredRef.current = true;
    } catch (err) {
      console.error('FCM save error:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!myId || myId === 'null' || !token) return;
    if (fcmRegisteredRef.current) return; // already registered this session

    // Register token if permission already granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      registerFcmToken();
    }

    // Foreground handler — desktop: in-app toast | mobile: OS notification bar
    listenForegroundMessages((payload) => {
      const title = payload.notification?.title || 'New Message';
      const body = payload.notification?.body || 'You have a new message';
      const chatUrl = payload.data?.url || '/chat';
      const senderId = payload.data?.senderId || '';

      const alreadyInChat =
        selectedUserRef.current && cleanId(selectedUserRef.current._id) === cleanId(senderId);
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
              if (found) {
                openChat(found);
              } else {
                window.location.href = chatUrl;
              }
            } else {
              window.location.href = chatUrl;
            }
          },
        },
        cancel: { label: '✕', onClick: () => {} },
      });
    });
  }, [myId, token]);

  // ── Called when user taps "Enable Notifications" button ───────────────────
  const handleEnableNotifications = async () => {
    await registerFcmToken();
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission);
    }
  };

  // ── Force refresh token (clears old token, gets new one) ──────────────────
  const forceRefreshToken = async () => {
    try {
      // Clear old SW registration to force new token
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();
      }
      fcmRegisteredRef.current = false;
      await registerFcmToken();
      if (typeof Notification !== 'undefined') {
        setNotifPermission(Notification.permission);
      }
    } catch (e) {
      console.error('Force refresh failed:', e.message);
    }
  };

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
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });
    socketRef.current.emit('join', myId);
    // no socket.emit('join', myId) — server joins the room itself from the verified JWT
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

    socketRef.current.on('message_edited', (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? { ...m, ...updatedMsg } : m))
      );
    });

    // Another tab/device soft-deleted a message we can see
    socketRef.current.on('message_deleted', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, deleted: true, message: '', imageUrl: null } : m
        )
      );
      setSelectedMsg((prev) => (prev && prev._id === messageId ? null : prev));
    });

    socketRef.current.on('online_users', (ids) => {
      if (Array.isArray(ids)) {
        const cleanedIds = ids.map((id) => cleanId(id)).filter((id) => id !== '');
        setOnlineUsers(cleanedIds);
      }
    });

    // typing on chat live viw scoket io

    socketRef.current.on('user_typing', ({ fromUserId }) => {
      const cleanFrom = cleanId(fromUserId);

      // Sidebar — mark this user as typing, clear after 3s of silence
      setTypingUsers((prev) => ({ ...prev, [cleanFrom]: true }));
      clearTimeout(sidebarTypingTimeoutsRef.current[cleanFrom]);
      sidebarTypingTimeoutsRef.current[cleanFrom] = setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [cleanFrom]: false }));
      }, 3000);
      // Header — only for the conversation currently open
      const activeUser = selectedUserRef.current;
      if (activeUser && cleanFrom === cleanId(activeUser._id)) {
        setIsPeerTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsPeerTyping(false);
        }, 3000);
      }
    });
    ///   video call code are here

    socketRef.current.on('incoming-call', ({ fromUserId, fromName, offer }) => {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setIncomingCall({ fromUserId, fromName, offer });
      setCallStatus('ringing');
    });

    socketRef.current.on('call-answered', async ({ answer }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        for (const c of pendingCandidatesRef.current) await pcRef.current.addIceCandidate(c);
        pendingCandidatesRef.current = [];
        setCallStatus('in-call');
      }
    });
    socketRef.current.on('ice-candidate', async ({ candidate }) => {
      if (!candidate) return;
      const ice = new RTCIceCandidate(candidate);
      if (pcRef.current && pcRef.current.remoteDescription) {
        await pcRef.current.addIceCandidate(ice);
      } else {
        pendingCandidatesRef.current.push(ice);
      }
    });

    socketRef.current.on('call-rejected', () => {
      toast('Call declined');
      cleanupCall();
    });

    socketRef.current.on('call-ended', () => {
      cleanupCall();
    });
    socketRef.current.on('message_reaction', ({ messageId, emoji, userId, action }) => {
      setMessageReactions((prev) => {
        const current = prev[messageId] || {};
        const users = current[emoji] || [];
        const updatedUsers =
          action === 'add' ? [...new Set([...users, userId])] : users.filter((id) => id !== userId);
        const updatedEmojiMap = { ...current, [emoji]: updatedUsers };
        if (updatedUsers.length === 0) delete updatedEmojiMap[emoji];
        return { ...prev, [messageId]: updatedEmojiMap };
      });
    });

    //////////////////////////////

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [myId]);

  // Only reconnect if the current user ID changes
  // ── Handle taps on a background call notification while app is/becomes open ──
  useEffect(() => {
    const handleSwMessage = (event) => {
      if (event.data?.type === 'CALL_NOTIFICATION_CLICK') {
        const { action, fromUserId } = event.data;
        if (action === 'decline') {
          socketRef.current?.emit('call-rejected', { toUserId: cleanId(fromUserId) });
          return;
        }
        if (action === 'accept' && incomingCall) {
          acceptCall();
        }
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSwMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
  }, [incomingCall]);

  // ── Handle the case where the SW had to open a brand-new tab ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callAction = params.get('callAction');
    const fromUserId = params.get('userId');
    if (callAction && fromUserId) {
      window.history.replaceState({}, '', '/chat');
      if (callAction === 'decline') {
        socketRef.current?.emit('call-rejected', { toUserId: cleanId(fromUserId) });
      }
    }
  }, [myId]);

  const fetchMessages = async (receiverId) => {
    const myRequestId = ++requestIdRef.current;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (myRequestId === requestIdRef.current && Array.isArray(res.data)) {
        setMessages(res.data);

        // Rebuild messageReactions from saved DB data
        const rebuilt = {};
        res.data.forEach((m) => {
          if (m.reactions?.length) {
            rebuilt[m._id] = {};
            m.reactions.forEach((r) => {
              if (!rebuilt[m._id][r.emoji]) rebuilt[m._id][r.emoji] = [];
              rebuilt[m._id][r.emoji].push(cleanId(r.userId));
            });
          }
        });
        setMessageReactions(rebuilt);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = async (targetUser) => {
    setSelectedUser(targetUser);
    setMessages([]);
    setSelectedMsg(null);
    cancelEdit();
    setIsPeerTyping(false); // naya user select karte hi purana typing status clear karo
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
    if (!file) return;

    // 25MB limit check
    if (file.size > 25 * 1024 * 1024) {
      toast('File too large', { description: 'Max file size is 25MB.' });
      return;
    }

    setImageFile(file);
    if (file.type.startsWith('image/')) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null); // non-image files ke liye preview nahi, sirf naam dikhega
    }
  };
  // typing on chat live
  const handleTyping = () => {
    if (!selectedUser || !socketRef.current) return;

    const now = Date.now();
    // Har 2 second me ek baar hi typing event bhejo (spam se bachne ke liye)
    if (now - lastTypingSentRef.current > 2000) {
      socketRef.current.emit('typing', { toUserId: cleanId(selectedUser._id) });
      lastTypingSentRef.current = now;
    }
  };
  const sendMessage = async (e) => {
    e.preventDefault();

    // ---- EDIT MODE: update the existing message instead of sending a new one ----
    if (editingMsg) {
      const trimmed = message.trim();
      if (!trimmed) return;
      const targetId = editingMsg._id;

      try {
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/chat/edit/${targetId}`,
          { message: trimmed },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages((prev) => prev.map((m) => (m._id === targetId ? { ...m, ...res.data } : m)));
        socketRef.current?.emit('editMessage', res.data);
      } catch (err) {
        console.error('Failed to edit message:', err.response?.data || err.message);
        toast('Could not edit message', { description: 'Please try again.' });
      } finally {
        cancelEdit();
      }
      return;
    }

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
          {typingUsers[cleanId(u._id)] ? (
            <p className="text-xs truncate font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="flex gap-0.5">
                <span
                  className="h-1 w-1 rounded-full bg-emerald-500 animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-1 w-1 rounded-full bg-emerald-500 animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-1 w-1 rounded-full bg-emerald-500 animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </span>
              typing...
            </p>
          ) : (
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
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div
      className={`flex h-screen w-full overflow-hidden ${theme === 'dark' ? 'bg-[#090D16] text-white' : 'bg-slate-50 text-slate-900'}`}
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

      <main className="flex-1 md:ml-72 flex flex-col h-screen pt-16 md:pt-0 overflow-hidden">
        <div className="flex flex-1 overflow-hidden w-full">
          {/* User List Sidebar */}
          <div
            className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800/60 flex flex-col bg-white dark:bg-[#0B0F19] ${selectedUser ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight uppercase text-indigo-500 dark:text-indigo-400">
                    Messages
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Group:{' '}
                    {!currentUser?.groupId || currentUser?.groupId === 'null'
                      ? 'Public / Ungrouped'
                      : currentUser.groupId}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                    <button
                      onClick={handleEnableNotifications}
                      className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-xl bg-indigo-500 text-white font-bold shadow hover:bg-indigo-600 active:scale-95 transition-all"
                    >
                      🔔 Enable Notifications
                    </button>
                  )}
                  {notifPermission === 'denied' && (
                    <span className="text-[10px] text-red-400 font-medium">🔕 Blocked</span>
                  )}
                  {notifPermission === 'granted' && (
                    <button
                      onClick={forceRefreshToken}
                      className="text-[10px] text-emerald-500 font-bold hover:text-emerald-600"
                      title="Refresh notification token"
                    >
                      🔔 On ↺
                    </button>
                  )}
                </div>
              </div>
            </div>

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

          {/* Chat Window */}
          <div
            className={`flex-1 min-w-0 flex flex-col bg-slate-50/30 dark:bg-[#080B11] ${selectedUser ? 'flex' : 'hidden md:flex'}`}
          >
            {selectedUser ? (
              <>
                {/* Chat Header */}
                {selectedMsg ? (
                  <div className="sticky top-0 z-20 px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 dark:border-slate-800/60 bg-indigo-50 dark:bg-indigo-950/40 flex items-center gap-3 md:gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSelection}
                      className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                    >
                      <X size={20} />
                    </Button>
                    <p className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                      1 selected
                    </p>
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={startEdit}
                        title="Edit"
                        className="h-9 w-9 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/10"
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={deleteSelectedMsg}
                        title="Delete"
                        className="h-9 w-9 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </>
                  </div>
                ) : (
                  <div className="sticky top-0 z-20 px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0B0F19]/90 dark:backdrop-blur-md flex items-center gap-3 md:gap-4">
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
                          {isPeerTyping
                            ? `${selectedUser?.fullname || selectedUser?.fullName || selectedUser?.name || 'User'} is typing...`
                            : onlineUsers.some((oid) => oid === cleanId(selectedUser._id))
                              ? 'Online'
                              : 'Offline'}
                        </span>
                      </div>
                    </div>
                    {/* ---------------- ADD THE VIDEO CALL BUTTON HERE ---------------- */}
                    <div className="ml-auto">
                      {selectedUser && callStatus === 'idle' && (
                        <button
                          onClick={() => startCall(selectedUser)}
                          title="Start video call"
                          className="h-9 w-9 flex items-center justify-center rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        >
                          <Video size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {/* Messages Area — Using a direct div for more reliable scrolling */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 flex flex-col space-y-4 no-scrollbar bg-slate-50/20 dark:bg-[#090D16]/40">
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
                      const isSelected = selectedMsg && selectedMsg._id === msg._id; // ADD

                      return (
                        <div
                          key={msg._id || i}
                          className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            onClick={() => handleMsgClick(msg)}
                            onDoubleClick={(e) => handleMsgDoubleClick(e, msg)}
                            onContextMenu={(e) => e.preventDefault()}
                            className={`relative max-w-[85%] md:max-w-[75%] lg:max-w-[65%] px-4 py-2.5 rounded-2xl text-[13.5px] font-medium shadow-sm transition-all select-none ${
                              msg.deleted ? 'cursor-default' : 'cursor-pointer'
                            } ${isSelected ? 'ring-2 ring-indigo-400 dark:ring-indigo-500' : ''} ${
                              msg.deleted
                                ? 'bg-slate-100 dark:bg-[#1E293B]/40 text-slate-400 dark:text-slate-500 italic border border-slate-200 dark:border-slate-800/40 rounded-tl-none rounded-tr-none'
                                : isMe
                                  ? 'bg-indigo-600 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-600 text-white rounded-tr-none shadow-indigo-500/10 dark:shadow-indigo-950/40'
                                  : 'bg-white dark:bg-[#1E293B]/70 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800/40 shadow-sm'
                            }`}
                          >
                            {msg.deleted ? (
                              <p className="flex items-center gap-1.5 leading-relaxed">
                                <Ban size={13} />
                                This message was deleted
                              </p>
                            ) : (
                              <>
                                {msg.imageUrl && (
                                  <img
                                    src={resolveUrl(msg.imageUrl)}
                                    alt="sent"
                                    className="rounded-xl max-w-[220px] mb-1.5 cursor-pointer hover:opacity-95 transition-opacity"
                                  />
                                )}
                                {msg.fileUrl && (
                                  <a
                                    href={resolveUrl(msg.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-white/10 dark:bg-black/20 rounded-xl px-3 py-2 mb-1.5 hover:opacity-80 transition-opacity"
                                  >
                                    <span className="text-2xl">
                                      {msg.fileType === 'pdf'
                                        ? '📄'
                                        : msg.fileType === 'doc'
                                          ? '📝'
                                          : msg.fileType === 'excel'
                                            ? '📊'
                                            : msg.fileType === 'video'
                                              ? '🎥'
                                              : msg.fileType === 'audio'
                                                ? '🎵'
                                                : '📎'}
                                    </span>
                                    <div className="text-left overflow-hidden">
                                      <p className="text-xs font-semibold truncate max-w-[180px]">
                                        {msg.fileName}
                                      </p>
                                      <p className="text-[10px] opacity-70">
                                        {msg.fileSize
                                          ? `${(msg.fileSize / 1024).toFixed(0)} KB`
                                          : ''}
                                      </p>
                                    </div>
                                  </a>
                                )}

                                {msg.message && (
                                  <p className="leading-relaxed whitespace-pre-wrap break-words [word-break:break-word] [overflow-wrap:anywhere]">
                                    {msg.message}
                                  </p>
                                )}
                              </>
                            )}
                            <p
                              className={`text-[9px] mt-1 flex items-center justify-end gap-1 font-black uppercase tracking-widest opacity-60 ${
                                isMe && !msg.deleted
                                  ? 'text-indigo-200/90'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {msg.edited && !msg.deleted && (
                                <span className="italic normal-case">edited</span>
                              )}{' '}
                              {/* ADD */}
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {reactionPickerMsg?._id === msg._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setReactionPickerMsg(null)}
                                />
                                <div
                                  className={`absolute -top-11 z-30 flex gap-4 bg-white dark:bg-[#1E293B] rounded-full shadow-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 ${isMe ? 'right-0' : 'left-0'}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {REACTION_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => toggleReaction(msg._id, emoji)}
                                      className="text-lg hover:scale-125 active:scale-95 transition-transform"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                            {/* Existing reactions on the message */}
                            {/* Existing reactions on the message — WhatsApp style: small pill overlapping bottom corner */}
                            {messageReactions[msg._id] &&
                              Object.keys(messageReactions[msg._id]).length > 0 && (
                                <div
                                  className={`absolute -bottom-3 flex items-center gap-0.5 bg-white dark:bg-[#252F3F] rounded-full shadow-md border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 ${
                                    isMe ? 'right-2' : 'left-2'
                                  }`}
                                >
                                  {Object.entries(messageReactions[msg._id]).map(
                                    ([emoji, users]) => (
                                      <button
                                        key={emoji}
                                        onClick={() => toggleReaction(msg._id, emoji)}
                                        className={`flex items-center gap-0.5 text-[13px] leading-none ${
                                          users.includes(myId) ? 'opacity-100' : 'opacity-90'
                                        }`}
                                      >
                                        <span>{emoji}</span>
                                      </button>
                                    )
                                  )}
                                  {Object.values(messageReactions[msg._id]).reduce(
                                    (sum, arr) => sum + arr.length,
                                    0
                                  ) > 1 && (
                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 ml-0.5">
                                      {Object.values(messageReactions[msg._id]).reduce(
                                        (sum, arr) => sum + arr.length,
                                        0
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
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
                  {editingMsg && (
                    <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-500/20">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <Pencil size={13} />
                        Editing message
                      </div>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {imageFile && !editingMsg && (
                    <div className="relative inline-flex items-center gap-2 mb-3 bg-slate-100 dark:bg-[#1E293B] rounded-xl px-3 py-2">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="h-14 w-14 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-14 w-14 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-2xl">
                          📎
                        </div>
                      )}
                      <div className="text-xs">
                        <p className="font-semibold truncate max-w-[150px]">{imageFile.name}</p>
                        <p className="text-slate-400">{(imageFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="ml-2 bg-rose-500 text-white rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,video/*,audio/*"
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
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
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
      {/* Incoming call banner — silent, vibrate only, no ringtone audio */}
      {incomingCall && (
        <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-pulse">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              {(incomingCall.fromName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {incomingCall.fromName}
              </p>
              <p className="text-xs text-slate-400">Incoming video call</p>
            </div>
            <button
              onClick={rejectCall}
              className="h-9 w-9 rounded-full bg-rose-500 text-white flex items-center justify-center"
            >
              <PhoneOff size={16} />
            </button>
            <button
              onClick={acceptCall}
              className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center"
            >
              <Phone size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Active call / calling overlay */}
      {(callStatus === 'calling' || callStatus === 'in-call') && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex-1 relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-slate-900"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-24 right-4 w-28 h-40 object-cover rounded-xl border-2 border-white/20 shadow-lg"
            />
            {callStatus === 'calling' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-white text-sm font-semibold">Calling {callPeerName}…</p>
              </div>
            )}
          </div>
          <div className="p-6 flex items-center justify-center gap-4 bg-black/80">
            <button
              onClick={toggleMic}
              className={`h-12 w-12 rounded-full flex items-center justify-center ${micOn ? 'bg-white/15 text-white' : 'bg-white text-black'}`}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              onClick={endCall}
              className="h-14 w-14 rounded-full bg-rose-600 text-white flex items-center justify-center"
            >
              <PhoneOff size={22} />
            </button>
            <button
              onClick={toggleCam}
              className={`h-12 w-12 rounded-full flex items-center justify-center ${camOn ? 'bg-white/15 text-white' : 'bg-white text-black'}`}
            >
              {camOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
