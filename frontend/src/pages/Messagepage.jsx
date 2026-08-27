import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { 
  MessageCircle, Send, ArrowLeft, Package, CheckCircle, 
  XCircle, AlertCircle, Loader2, Tag, Info, Handshake 
} from 'lucide-react';

import { chatApi, API_BASE } from '../utils/api';

// FIX (message ordering race): two people sending at nearly the same
// moment fire two independent async DB round-trips on the server, so the
// order their 'new_message' events actually ARRIVE over the socket isn't
// guaranteed to match the order they were sent in -- and isn't guaranteed
// to be the same order on the buyer's screen vs the seller's screen.
// Always inserting by createdAt (instead of trusting array-push/arrival
// order) means both participants converge on the same, correct
// chronological order regardless of network/delivery timing.
const insertSorted = (list, msg) => {
  const next = [...list, msg];
  next.sort((a, b) => {
    const diff = new Date(a.createdAt) - new Date(b.createdAt);
    if (diff !== 0) return diff;
    // Stable tiebreaker for same-millisecond messages so re-sorts don't
    // jitter two simultaneous messages back and forth on every render.
    return String(a._id).localeCompare(String(b._id));
  });
  return next;
};

const ConversationRow = ({ conversation, currentUserId, isActive, onClick }) => {
  const isBuyer = String(conversation.buyer?._id || conversation.buyer) === String(currentUserId);
  const otherParty = isBuyer ? conversation.seller : conversation.buyer;
  const item = conversation.listing;
  const isUnread = isBuyer ? conversation.buyerUnread : conversation.sellerUnread;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-gray-50 dark:border-gray-800/50 flex gap-3 transition-all relative ${
        isActive ? 'bg-blue-50/80 dark:bg-blue-900/20 shadow-inner' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
      }`}
    >
      <div className="relative w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
        {item?.images?.[0] ? (
          <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
        {isUnread && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
        )}
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className={`font-semibold text-sm truncate ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>
            {otherParty?.name || "Unknown User"}
          </h4>
          {conversation.lastMessage?.createdAt && (
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 flex-shrink-0">
              {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 truncate mt-0.5 uppercase tracking-wide">
          {item?.title || "Deleted Item"}
        </p>
        <p className={`text-xs mt-1 truncate ${isUnread ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
          {conversation.dealLocked ? '🤝 Deal Locked!' : conversation.lastMessage?.text || "No messages yet"}
        </p>
      </div>
    </button>
  );
};

const NegotiationBanner = ({ conversation, currentUserId, onUpdate }) => {
  const [isProposing, setIsProposing] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);

  const isBuyer = String(conversation.buyer?._id || conversation.buyer) === String(currentUserId);
  const myConfirmation = isBuyer ? conversation.buyerConfirmed : conversation.sellerConfirmed;
  const theirConfirmation = isBuyer ? conversation.sellerConfirmed : conversation.buyerConfirmed;
  const amIProposer = String(conversation.proposedBy) === String(currentUserId);

  const itemPrice = conversation.listing?.price;

  const handleAction = async (actionFn) => {
    setLoadingAction(true);
    setError(null);
    try {
      const data = await actionFn();
      if (onUpdate) onUpdate(data.conversation);
      setIsProposing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  if (conversation.dealLocked) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-emerald-100 dark:border-emerald-900/50 p-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shadow-inner">
            <Handshake className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-wide">Agreement Locked!</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Final Price: <span className="font-bold text-sm">₹{conversation.finalPrice}</span>. Please arrange a campus meetup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isProposing) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 shadow-sm relative shrink-0">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-blue-500" /> Propose a New Price
        </h4>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder={`Original: ₹${itemPrice}`}
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white transition-all"
          />
          <button 
            onClick={() => handleAction(() => chatApi.proposePrice(conversation._id, Number(priceInput)))}
            disabled={loadingAction || !priceInput}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {loadingAction ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Send Proposal'}
          </button>
          <button 
            onClick={() => { setIsProposing(false); setError(null); }}
            className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3"/>{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
      <div>
        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Negotiation Contract</div>
        {conversation.proposedPrice ? (
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {amIProposer ? 'You proposed:' : 'They proposed:'} <span className="text-lg font-black text-gray-900 dark:text-white ml-1">₹{conversation.proposedPrice}</span>
            </p>
            <p className="text-xs mt-1 font-medium text-gray-500 dark:text-gray-400">
              {myConfirmation && theirConfirmation ? "Locking deal..." : 
               myConfirmation ? `⏳ Waiting for ${isBuyer ? 'Seller' : 'Buyer'} to accept` : 
               theirConfirmation ? `✨ They accepted! Waiting for your confirmation.` : 
               "Neither party has accepted yet."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300">No active proposals. Listed at <span className="font-bold">₹{itemPrice}</span>.</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {conversation.proposedPrice && (
          myConfirmation ? (
            <button 
              onClick={() => handleAction(() => chatApi.unconfirmPrice(conversation._id))}
              disabled={loadingAction}
              className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Accepted (Undo)
            </button>
          ) : (
            <button 
              onClick={() => handleAction(() => chatApi.confirmPrice(conversation._id))}
              disabled={loadingAction}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Accept Price
            </button>
          )
        )}
        <button 
          onClick={() => { setPriceInput(''); setIsProposing(true); }}
          className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          {conversation.proposedPrice ? 'Counter-Offer' : 'Propose Price'}
        </button>
      </div>
    </div>
  );
};

const MessagesPage = ({ navigate, currentPath = '/messages', currentUser }) => {
  const [inbox, setInbox] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [nextCursor, setNextCursor] = useState(null);
  
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // The socket listeners below are registered once (tied to [currentUser,
  // deepLink]), so they'd otherwise close over a stale `activeConversation`
  // from whichever render set them up. This ref is kept in sync on every
  // change so the handlers can always check "is this event for the thread
  // that's actually open right now".
  const activeConversationIdRef = useRef(null);
  useEffect(() => {
    activeConversationIdRef.current = activeConversation?._id || null;
  }, [activeConversation?._id]);

  const deepLink = useMemo(() => {
    const qs = currentPath.includes('?') ? currentPath.split('?')[1] : '';
    const params = new URLSearchParams(qs);
    const listingId = params.get('listing');
    const sellerId = params.get('seller');
    return (listingId && sellerId) ? { listingId, sellerId } : null;
  }, [currentPath]);

  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io(API_BASE || window.location.origin, { withCredentials: true });

    const initializeChat = async () => {
      setIsLoadingInbox(true);
      try {
        let activeChatInstance = null;
        
        if (deepLink) {
          const res = await chatApi.createOrGet(deepLink.listingId, deepLink.sellerId);
          if (res?.conversation) activeChatInstance = res.conversation;
        }

        const inboxRes = await chatApi.getInbox();
        if (inboxRes?.conversations) {
          setInbox(inboxRes.conversations);
          if (!activeChatInstance && inboxRes.conversations.length > 0) {
            activeChatInstance = inboxRes.conversations[0];
          }
        }

        if (activeChatInstance) {
          setActiveConversation(activeChatInstance);
        }
      } catch (error) {
        console.error("Failed to load chat data", error);
      } finally {
        setIsLoadingInbox(false);
      }
    };

    initializeChat();

    socketRef.current.on('new_message', (msg) => {
      // The server broadcasts new_message to every conversation this user
      // is part of, not just the one that's open — without this check, a
      // message belonging to a different chat gets appended to whichever
      // thread happens to be on screen.
      if (String(msg.conversation) !== String(activeConversationIdRef.current)) return;

      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;

        // FIX: previously matched our own echoed-back message to its
        // optimistic placeholder by comparing TEXT, which misfired
        // whenever the same short text ("ok", "yes") was sent twice in a
        // row — it could replace the wrong placeholder, or leave a
        // duplicate/ghost message behind. clientId is a value WE generate
        // in handleSendMessage and the server echoes back unchanged, so
        // this now matches the exact send, unambiguously.
        const isMine = String(msg.sender?._id || msg.sender) === String(currentUser?.id);
        if (isMine && msg.clientId) {
          const tempIndex = prev.findIndex((m) => m.clientId === msg.clientId);
          if (tempIndex !== -1) {
            const next = [...prev];
            next[tempIndex] = msg;
            next.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt) || String(a._id).localeCompare(String(b._id)));
            return next;
          }
        }

        return insertSorted(prev, msg);
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    socketRef.current.on('conversation_updated', (updatedData) => {
      setInbox(prev => {
        const existing = prev.find(c => c._id === updatedData._id);
        if (!existing) {
          chatApi.getInbox().then(res => setInbox(res.conversations || []));
          return prev;
        }
        const newList = prev.map(c => c._id === updatedData._id ? { ...c, ...updatedData } : c);
        return newList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    socketRef.current.on('price_updated', (data) => updateConversationState(data));
    socketRef.current.on('deal_locked', (data) => updateConversationState({ ...data, dealLocked: true }));

    socketRef.current.on('chat_error', (data) => {
      console.error(data.message || "Socket error occurred");
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser, deepLink]);

  const updateConversationState = (data) => {
    setActiveConversation(prev => prev && prev._id === data.conversationId ? { ...prev, ...data } : prev);
    setInbox(prev => prev.map(c => c._id === data.conversationId ? { ...c, ...data } : c));
  };

  useEffect(() => {
    if (!activeConversation) return;

    // Guards against a race: if you click Chat A then quickly click Chat B,
    // Chat A's getMessages request can resolve AFTER Chat B's and overwrite
    // the thread you're now looking at with Chat A's (stale) messages.
    let isCurrent = true;
    const conversationId = activeConversation._id;

    const fetchHistory = async () => {
      setIsLoadingMessages(true);
      try {
        setInbox(prev => prev.map(c => c._id === conversationId ? { 
          ...c, 
          buyerUnread: String(c.buyer?._id || c.buyer) === String(currentUser.id) ? false : c.buyerUnread,
          sellerUnread: String(c.seller?._id || c.seller) === String(currentUser.id) ? false : c.sellerUnread 
        } : c));

        const res = await chatApi.getMessages(conversationId);
        if (res && isCurrent) {
          setMessages(res.messages);
          setNextCursor(res.nextCursor);
        }
        
        if (socketRef.current?.connected) {
           socketRef.current.emit("mark_read", { conversationId });
        } else {
           chatApi.markRead(conversationId).catch(()=>{});
        }
        
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        if (isCurrent) {
          setIsLoadingMessages(false);
          setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
        }
      }
    };

    fetchHistory();
    return () => { isCurrent = false; };
  }, [activeConversation?._id]);

  const loadMoreMessages = async () => {
    if (!nextCursor || !activeConversation) return;
    setIsLoadingMore(true);
    try {
      const res = await chatApi.getMessages(activeConversation._id, nextCursor);
      if (res) {
        setMessages(prev => [...res.messages, ...prev]);
        setNextCursor(res.nextCursor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    // FIX: previously this silently no-op'd if the socket object existed
    // but had disconnected (e.g. a brief network blip) -- the text would
    // clear from the input and an optimistic bubble would still appear,
    // but nothing was ever actually sent, so the other person never saw
    // it and it would vanish on refresh. Surfacing that instead of
    // pretending it worked.
    if (!socketRef.current?.connected) {
      alert("You're disconnected — reconnecting. Please try sending again in a moment.");
      return;
    }

    const text = messageInput.trim();
    setMessageInput('');

    // FIX: this id is generated here and echoed back unchanged by the
    // server (see Chat.socket.js) so new_message can match this exact
    // send back to its own placeholder by id instead of by text.
    const clientId = `${currentUser.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    socketRef.current.emit("send_message", { conversationId: activeConversation._id, text, clientId });

    const optimisticMsg = {
      _id: `temp-${clientId}`,
      clientId,
      text,
      sender: { _id: currentUser.id, name: currentUser.name },
      createdAt: new Date().toISOString()
    };

    setMessages(prev => insertSorted(prev, optimisticMsg));
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const showThreadOnMobile = !!activeConversation;
  
  if (isLoadingInbox) {
    return <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-73px)]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  // Determine if listing status allows negotiation (anything except Sold or Rejected)
  const listingStatus = activeConversation?.listing?.status;
  const isNegotiationAllowed = listingStatus !== "Sold" && listingStatus !== "Rejected";

  return (
    <div className="flex-1 flex h-[calc(100vh-73px)] max-w-7xl mx-auto w-full sm:p-6 bg-gray-50 dark:bg-gray-950 font-sans">
      <div className="w-full bg-white dark:bg-gray-900 sm:rounded-3xl border border-gray-200 dark:border-gray-800 sm:shadow-lg flex overflow-hidden">

        {/* LEFT PANE: INBOX LIST */}
        <div className={`w-full sm:w-[320px] md:w-[380px] border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 ${showThreadOnMobile ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
            <h2 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">Messages</h2>
            <div className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">
              {inbox.length} Chats
            </div>
          </div>

          {inbox.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              {inbox.map((conversation) => (
                <ConversationRow
                  key={conversation._id}
                  conversation={conversation}
                  currentUserId={currentUser?.id}
                  isActive={activeConversation?._id === conversation._id}
                  onClick={() => setActiveConversation(conversation)}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-inner">
                <MessageCircle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">No chats yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Message a seller from a listing to start negotiating.</p>
            </div>
          )}
        </div>

        {/* RIGHT PANE: ACTIVE THREAD */}
        <div className={`flex-1 flex-col relative bg-gray-50 dark:bg-gray-950/50 ${showThreadOnMobile ? 'flex' : 'hidden sm:flex'}`}>
          {activeConversation ? (
            <>
              {/* HEADER */}
              <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 shrink-0 shadow-sm z-10">
                <button onClick={() => setActiveConversation(null)} className="sm:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer" onClick={() => navigate(`/listing/${activeConversation.listing?._id}`)}>
                  {activeConversation.listing?.images?.[0] ? (
                    <img src={activeConversation.listing.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-base text-gray-900 dark:text-white truncate flex items-center gap-2">
                    {String(activeConversation.buyer?._id || activeConversation.buyer) === String(currentUser?.id) 
                      ? activeConversation.seller?.name 
                      : activeConversation.buyer?.name}
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] rounded-md font-bold uppercase tracking-wider">
                      {String(activeConversation.buyer?._id || activeConversation.buyer) === String(currentUser?.id) ? 'Seller' : 'Buyer'}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate cursor-pointer hover:underline" onClick={() => navigate(`/listing/${activeConversation.listing?._id}`)}>
                    {activeConversation.listing?.title || "Listing Deleted"} • ₹{activeConversation.listing?.price ?? "—"}
                  </div>
                </div>
              </div>

              {/* NEGOTIATION BANNER */}
              {isNegotiationAllowed || activeConversation.dealLocked ? (
                <NegotiationBanner 
                  conversation={activeConversation} 
                  currentUserId={currentUser?.id} 
                  onUpdate={(updatedData) => updateConversationState({ conversationId: activeConversation._id, ...updatedData })} 
                />
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50 p-3 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium shrink-0 shadow-sm">
                  <Info className="w-4 h-4" /> This listing is no longer active ({listingStatus}). Negotiation is disabled.
                </div>
              )}

              {/* MESSAGE AREA */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative">
                {isLoadingMessages ? (
                  <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : (
                  <>
                    {nextCursor && (
                      <div className="flex justify-center mb-4">
                        <button 
                          onClick={loadMoreMessages} 
                          disabled={isLoadingMore}
                          className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:shadow-md transition-all flex items-center gap-2"
                        >
                          {isLoadingMore && <Loader2 className="w-3 h-3 animate-spin"/>} Load Older Messages
                        </button>
                      </div>
                    )}
                    
                    {messages.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = String(msg.sender?._id || msg.sender) === String(currentUser?.id);
                        return (
                          <div key={msg._id} className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                            {!isMe && <span className="text-[10px] text-gray-400 ml-1 mb-0.5">{msg.sender?.name}</span>}
                            <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                              isMe 
                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                            }`}>
                              {msg.text}
                            </div>
                            <span className={`text-[10px] font-medium text-gray-400 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* INPUT AREA */}
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={activeConversation.dealLocked ? "Message buyer about meetup..." : "Type your message..."}
                    className="flex-1 h-12 bg-gray-100 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 border border-transparent focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/20 rounded-full pl-5 pr-14 text-[15px] outline-none transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="absolute right-1.5 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4 ml-0.5 mt-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3 bg-white dark:bg-gray-900 rounded-r-3xl">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center shadow-inner mb-2 border border-blue-100 dark:border-gray-700">
                <MessageCircle className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">Your Messages</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Pick a chat from the left sidebar to view messages, negotiate prices, and finalize deals.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessagesPage;