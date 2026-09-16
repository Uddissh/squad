export const dynamic = 'force-dynamic'

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [err, setErr] = useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    const fn = mode === 'in' ? supabase.auth.signInWithPassword : supabase.auth.signUp
    const { error } = await fn({ email, password })
    if (error) return setErr(error.message)
    router.push('/')
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', padding: 24 }}>
      <h1>Squad</h1>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button type="submit" style={btnStyle}>{mode === 'in' ? 'Sign in' : 'Sign up'}</button>
      </form>
      {err && <p style={{ color: '#f66' }}>{err}</p>}
      <p onClick={() => setMode(mode === 'in' ? 'up' : 'in')} style={{ cursor: 'pointer', color: '#7aa2ff' }}>
        {mode === 'in' ? "Need an account? Sign up" : 'Have an account? Sign in'}
      </p>
    </div>
  )
}

const inputStyle = { padding: 10, borderRadius: 6, border: '1px solid #333', background: '#1a1c22', color: '#eee' }
const btnStyle = { padding: 10, borderRadius: 6, border: 'none', background: '#5865f2', color: '#fff', cursor: 'pointer' }
