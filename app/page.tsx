'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Channel = { id: string; name: string }
type Message = { id: string; content: string; user_id: string; created_at: string }
type Party = { id: string; message: string; slots_needed: number; user_id: string }

const STATUSES = ['online', 'in_game', 'lfg', 'away'] as const

export default function Home() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [party, setParty] = useState<Party[]>([])
  const [status, setStatus] = useState('away')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return router.push('/login')
      setUserId(data.user.id)
      supabase.from('profiles').upsert({ id: data.user.id }, { onConflict: 'id', ignoreDuplicates: true }).then(() => {})
    })
    supabase.from('channels').select('*').then(({ data }) => {
      setChannels(data ?? [])
      if (data?.length) setActiveChannel(data[0].id)
    })
    supabase.from('party_posts').select('*').order('created_at', { ascending: false }).then(({ data }) => setParty(data ?? []))
  }, [])

  useEffect(() => {
    if (!activeChannel) return
    supabase.from('messages').select('*').eq('channel_id', activeChannel).order('created_at').then(({ data }) => setMessages(data ?? []))
    const sub = supabase
      .channel(`messages-${activeChannel}`)
      .on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel}` }, (payload: any) => {
        setMessages(m => [...m, payload.new])
      })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [activeChannel])

  async function send() {
    if (!draft.trim() || !activeChannel || !userId) return
    await supabase.from('messages').insert({ channel_id: activeChannel, user_id: userId, content: draft })
    setDraft('')
  }

  async function updateStatus(s: string) {
    setStatus(s)
    if (userId) await supabase.from('profiles').update({ status: s }).eq('id', userId)
  }

  async function postParty(message: string) {
    if (!userId || !message.trim()) return
    const { data } = await supabase.from('party_posts').insert({ user_id: userId, message, slots_needed: 1 }).select()
    if (data) setParty(p => [data[0], ...p])
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 200, borderRight: '1px solid #23252b', padding: 16 }}>
        <h3>Channels</h3>
        {channels.map(c => (
          <div key={c.id} onClick={() => setActiveChannel(c.id)}
            style={{ padding: 8, cursor: 'pointer', borderRadius: 6, background: c.id === activeChannel ? '#23252b' : 'transparent' }}>
            #{c.name}
          </div>
        ))}
        <h3 style={{ marginTop: 24 }}>Status</h3>
        <select value={status} onChange={e => updateStatus(e.target.value)} style={{ width: '100%', padding: 6 }}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {messages.map(m => <div key={m.id} style={{ marginBottom: 6 }}>{m.content}</div>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="message" style={{ flex: 1, padding: 10, background: '#1a1c22', color: '#eee', border: '1px solid #333', borderRadius: 6 }} />
          <button onClick={send} style={{ padding: '10px 16px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 6 }}>Send</button>
        </div>
      </main>

      <aside style={{ width: 260, borderLeft: '1px solid #23252b', padding: 16 }}>
        <h3>LFG / Party board</h3>
        <PartyForm onPost={postParty} />
        {party.map(p => <div key={p.id} style={{ padding: 8, background: '#1a1c22', borderRadius: 6, marginBottom: 8 }}>{p.message}</div>)}
      </aside>
    </div>
  )
}

function PartyForm({ onPost }: { onPost: (m: string) => void }) {
  const [v, setV] = useState('')
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
      <input value={v} onChange={e => setV(e.target.value)} placeholder="need 1 more for ranked"
        style={{ flex: 1, padding: 8, background: '#1a1c22', color: '#eee', border: '1px solid #333', borderRadius: 6 }} />
      <button onClick={() => { onPost(v); setV('') }} style={{ padding: '8px 12px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 6 }}>Post</button>
    </div>
  )
}
