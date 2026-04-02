'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import { useChatRealtime } from '@/hooks/useRealtime'
import { Button } from '@/components/ui/button'
import { Paperclip, Send, FileText, Loader2 } from 'lucide-react'
import type { Message, MessageAttachment, SenderType } from '@/types/database'

interface ChatWindowProps {
  tramiteId: string
  senderType: 'broker' | 'notaria'
}

export default function ChatWindow({ tramiteId, senderType }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(true)
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('tramite_id', tramiteId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data as Message[])
    }
    setLoading(false)
  }, [tramiteId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription for new messages
  useChatRealtime(tramiteId, (newMessage) => {
    setMessages((prev) => {
      // Avoid duplicates (our own optimistic inserts)
      if (prev.some((m) => m.id === newMessage.id)) return prev
      return [...prev, newMessage]
    })
    setConnected(true)
  })

  // Auto-grow textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    const maxHeight = 4 * 24 + 16 // 4 rows * line-height + padding
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const uploadAttachment = async (file: File): Promise<MessageAttachment | null> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${tramiteId}/${Date.now()}-${safeName}`

    const { data, error } = await supabase.storage
      .from('tramite-documents')
      .upload(path, file, { upsert: false })

    if (error) return null

    const { data: urlData } = supabase.storage
      .from('tramite-documents')
      .getPublicUrl(data.path)

    return {
      name: file.name,
      url: urlData.publicUrl,
      type: file.type,
    }
  }

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed && !pendingAttachment) return
    if (sending) return

    setSending(true)

    try {
      let attachments: MessageAttachment[] = []

      if (pendingAttachment) {
        setUploadingAttachment(true)
        const att = await uploadAttachment(pendingAttachment)
        setUploadingAttachment(false)
        if (att) attachments = [att]
        setPendingAttachment(null)
      }

      const { data, error } = await supabase.from('messages').insert({
        tramite_id: tramiteId,
        sender_type: senderType as SenderType,
        sender_id: null,
        content: trimmed,
        attachments,
        read_at: null,
      }).select().single()

      if (error) throw error

      // Optimistic add
      if (data) {
        setMessages((prev) => [...prev, data as Message])
      }

      setText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err: any) {
      toast.error('No se pudo enviar el mensaje. Inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 10 MB.')
      return
    }
    setPendingAttachment(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const isImage = (type: string) => type.startsWith('image/')

  return (
    <div className="flex flex-col h-full min-h-[400px] max-h-[600px] bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Connection status header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0">
        <span className="text-sm font-medium text-slate-700">Chat con Notaría</span>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              connected ? 'bg-green-500' : 'bg-amber-500'
            )}
          />
          <span className="text-xs text-slate-500">
            {connected ? 'Conectado' : 'Reconectando...'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-sm text-slate-400">
              No hay mensajes aún. Inicia la conversación.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isBroker = msg.sender_type === 'broker'
            return (
              <div
                key={msg.id}
                className={cn('flex flex-col gap-1', isBroker ? 'items-end' : 'items-start')}
              >
                {/* Attachments */}
                {msg.attachments?.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'block rounded-xl overflow-hidden border',
                      isBroker
                        ? 'border-[#18181B]/20 rounded-tr-sm'
                        : 'border-[#18181B]/10 rounded-tl-sm'
                    )}
                  >
                    {isImage(att.type) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={att.url}
                        alt={att.name}
                        className="max-w-[200px] max-h-[200px] object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-2',
                          isBroker ? 'bg-[#18181B] text-white' : 'bg-[#18181B]/6 text-[#18181B]'
                        )}
                      >
                        <FileText size={16} className="shrink-0" />
                        <span className="text-xs font-medium truncate max-w-[160px]">
                          {att.name}
                        </span>
                      </div>
                    )}
                  </a>
                ))}

                {/* Text bubble */}
                {msg.content && (
                  <div
                    className={cn(
                      'max-w-[75%] px-3.5 py-2 text-sm leading-relaxed',
                      isBroker
                        ? 'bg-[#18181B] text-white rounded-xl rounded-tr-sm'
                        : 'bg-[#18181B]/6 text-[#18181B] rounded-xl rounded-tl-sm'
                    )}
                  >
                    {msg.content}
                  </div>
                )}

                {/* Timestamp */}
                <time
                  dateTime={msg.created_at}
                  className="text-[11px] text-slate-400 px-1"
                >
                  {formatDateTime(msg.created_at)}
                </time>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Pending attachment preview */}
      {pendingAttachment && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
          <FileText size={14} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 truncate flex-1">{pendingAttachment.name}</span>
          <button
            type="button"
            onClick={() => setPendingAttachment(null)}
            className="text-xs text-red-500 hover:text-red-700 shrink-0"
          >
            Quitar
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="sticky bottom-0 flex items-end gap-2 px-3 py-3 border-t border-slate-100 bg-white shrink-0">
        {/* Attachment button */}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
          aria-label="Adjuntar archivo"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          disabled={sending}
          className="shrink-0 text-slate-400 hover:text-slate-600"
          aria-label="Adjuntar archivo"
        >
          <Paperclip size={18} />
        </Button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          disabled={sending}
          className={cn(
            'flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2',
            'text-sm text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-[#18181B]/20 focus:border-[#18181B]/30',
            'disabled:opacity-50 transition-all'
          )}
          style={{ minHeight: '40px', maxHeight: `${4 * 24 + 16}px` }}
        />

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={sending || uploadingAttachment || (!text.trim() && !pendingAttachment)}
          className="shrink-0"
          aria-label="Enviar mensaje"
        >
          {sending || uploadingAttachment ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </Button>
      </div>
    </div>
  )
}
