import React, { createContext, useContext, useReducer, useCallback } from 'react';

const Ctx = createContext(null);

const initial = {
  view: 'home',           // home | server | friends | settings
  activeServer: null,
  activeChannel: null,
  activeConversation: null,
  modal: null,             // create-server | join-server | create-channel | add-friend | invite | settings | profile
  modalData: null,
  showMembers: true,
  replyTo: null,
  editingMessage: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'GO_HOME': return { ...state, view: 'home', activeServer: null, activeChannel: null, activeConversation: null, replyTo: null, editingMessage: null };
    case 'GO_FRIENDS': return { ...state, view: 'friends', activeConversation: null, replyTo: null, editingMessage: null };
    case 'SELECT_SERVER': return { ...state, view: 'server', activeServer: action.server, activeChannel: null, activeConversation: null, replyTo: null, editingMessage: null };
    case 'SELECT_CHANNEL': return { ...state, view: 'server', activeChannel: action.channel, activeConversation: null, replyTo: null, editingMessage: null };
    case 'SELECT_CONVERSATION': return { ...state, view: 'home', activeConversation: action.conversation, activeServer: null, activeChannel: null, replyTo: null, editingMessage: null };
    case 'SET_MODAL': return { ...state, modal: action.modal, modalData: action.data || null };
    case 'CLOSE_MODAL': return { ...state, modal: null, modalData: null };
    case 'TOGGLE_MEMBERS': return { ...state, showMembers: !state.showMembers };
    case 'SET_REPLY': return { ...state, replyTo: action.message };
    case 'CLEAR_REPLY': return { ...state, replyTo: null };
    case 'SET_EDITING': return { ...state, editingMessage: action.message };
    case 'CLEAR_EDITING': return { ...state, editingMessage: null };
    case 'SET_VIEW': return { ...state, view: action.view };
    default: return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useAppState() {
  return useContext(Ctx);
}