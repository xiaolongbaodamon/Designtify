import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Share2,
  Database,
  Radio,
  Sparkles,
  Circle,
  ShieldCheck,
  Edit2,
  UserCheck,
  Cloud,
  CloudCheck,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { CollabUser, CanvasDesign } from '../types/design';
import { COLLAB_COLORS } from '../services/collaboration';
import {
  auth,
  loginWithGoogle,
  loginAnonymously,
  logoutUser,
  firebaseConfig,
} from '../services/firebase';
import { saveDesignToFirestore } from '../services/firebaseSync';
import { User, onAuthStateChanged } from 'firebase/auth';

interface TeamCollabModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: CollabUser[];
  currentUser: CollabUser;
  onUpdateUser: (updates: Partial<CollabUser>) => void;
  roomId: string;
  design: CanvasDesign;
  onDesignSaved?: () => void;
}

export const TeamCollabModal: React.FC<TeamCollabModalProps> = ({
  isOpen,
  onClose,
  collaborators,
  currentUser,
  onUpdateUser,
  roomId,
  design,
  onDesignSaved,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [userName, setUserName] = useState(currentUser.name);
  const [isEditingName, setIsEditingName] = useState(false);

  // Firebase auth state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudSaveMessage, setCloudSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user?.displayName && user.displayName !== currentUser.name) {
        onUpdateUser({ name: user.displayName });
      }
    });
    return () => unsub();
  }, [currentUser.name, onUpdateUser]);

  if (!isOpen) return null;

  const roomLink = `${window.location.origin}?room=${roomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNameSave = () => {
    if (userName.trim()) {
      onUpdateUser({ name: userName.trim() });
      setIsEditingName(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        setFirebaseUser(user);
        if (user.displayName) onUpdateUser({ name: user.displayName });
      }
    } catch (e) {
      console.warn('Google login dismissed or failed, trying anonymous login...', e);
      try {
        const anonUser = await loginAnonymously();
        setFirebaseUser(anonUser);
      } catch (errAnon) {
        console.error('Anonymous login failed too:', errAnon);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSaveToCloud = async () => {
    setIsSavingCloud(true);
    setCloudSaveMessage(null);
    try {
      const success = await saveDesignToFirestore(design, false);
      if (success) {
        setCloudSaveMessage('Design successfully synced to Firebase Cloud Firestore!');
        onDesignSaved?.();
        setTimeout(() => setCloudSaveMessage(null), 4000);
      }
    } catch (e: any) {
      setCloudSaveMessage('Saved locally (Firestore requires active internet or authorized domain).');
    } finally {
      setIsSavingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Team Collaboration & Cloud Sync</h2>
              <p className="text-xs text-slate-400">Live multi-user sync powered by Firebase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
          {/* Firebase Connection & Auth Status Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/30 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Firebase Project Connected</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                {firebaseConfig.projectId}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-300">
                {firebaseUser ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Logged in as {firebaseUser.displayName || firebaseUser.email || 'Anonymous Member'}
                  </span>
                ) : (
                  <span className="text-slate-400">Sign in to save projects to your cloud library</span>
                )}
              </div>

              {firebaseUser ? (
                <button
                  onClick={() => logoutUser()}
                  className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign out</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isAuthenticating}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold rounded-lg flex items-center gap-1 transition"
                >
                  <LogIn className="w-3 h-3" />
                  <span>{isAuthenticating ? 'Signing in...' : 'Sign In'}</span>
                </button>
              )}
            </div>

            {/* Direct Save to Cloud Button */}
            <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
              <button
                onClick={handleSaveToCloud}
                disabled={isSavingCloud}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                {isSavingCloud ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Save Project to Firestore Cloud</span>
                  </>
                )}
              </button>
            </div>

            {cloudSaveMessage && (
              <div className="text-[11px] text-emerald-400 font-medium text-center bg-emerald-950/40 p-1.5 rounded border border-emerald-800/40">
                {cloudSaveMessage}
              </div>
            )}
          </div>

          {/* Shareable Link Box */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Share Workspace Room Link
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl p-1.5 pl-3">
              <span className="text-xs text-slate-300 font-mono truncate flex-1">{roomLink}</span>
              <button
                onClick={handleCopyLink}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              💡 Open this link in another tab or window to see real-time multiplayer cursors and
              instant element updates in action!
            </p>
          </div>

          {/* User Profile Customization */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-300">Your Presence & Color</span>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full border-2 border-white shadow flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.name.substring(0, 1)}
              </div>

              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                      className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none w-full"
                      autoFocus
                    />
                    <button
                      onClick={handleNameSave}
                      className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-slate-400 hover:text-white"
                      title="Edit Name"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="text-[10px] text-slate-400">Current active team member (You)</div>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
              <span className="text-[11px] text-slate-400">Teammate Color:</span>
              <div className="flex items-center gap-1.5">
                {COLLAB_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateUser({ color: c })}
                    className={`w-5 h-5 rounded-full transition transform hover:scale-110 ${
                      currentUser.color === c ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Active Collaborators List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Online Members ({collaborators.length + 1})
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live WebSocket Channel
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Current user entry */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/70 text-xs">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow"
                    style={{ backgroundColor: currentUser.color }}
                  >
                    {currentUser.name.substring(0, 1)}
                  </div>
                  <span className="font-semibold text-white">{currentUser.name} (You)</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">ACTIVE</span>
              </div>

              {/* Other collaborators */}
              {collaborators.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.name.substring(0, 1)}
                    </div>
                    <span className="font-medium text-slate-200">{u.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Connected</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
