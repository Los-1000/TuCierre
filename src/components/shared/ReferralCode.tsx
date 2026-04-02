'use client'

import { useState } from 'react'
import { Copy, Check, Share2, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ReferralCodeProps {
  code: string
}

export default function ReferralCode({ code }: ReferralCodeProps) {
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const referralUrl = `${window.location.origin}/register?ref=${code}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Código copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(referralUrl)
    setLinkCopied(true)
    toast.success('Enlace de registro copiado')
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleShare = async () => {
    const shareData = {
      title: 'TuCierre — Trámites notariales digitales',
      text: `Regístrate en TuCierre y gestiona tus trámites notariales de forma digital. Usa mi código: ${code}`,
      url: referralUrl,
    }
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(referralUrl)
      toast.success('Enlace copiado al portapapeles')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
          <code className="font-mono text-sm font-semibold text-[#18181B] tracking-wider flex-1">
            {code}
          </code>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          aria-label="Copiar código"
          className="shrink-0"
        >
          {copied ? <Check size={16} className="text-brand-green" /> : <Copy size={16} />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          aria-label="Compartir"
          className="shrink-0"
        >
          <Share2 size={16} />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <LinkIcon size={13} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 truncate flex-1 font-mono">{referralUrl}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          aria-label="Copiar enlace"
          className="shrink-0"
        >
          {linkCopied ? <Check size={16} className="text-brand-green" /> : <Copy size={16} />}
        </Button>
      </div>
    </div>
  )
}
