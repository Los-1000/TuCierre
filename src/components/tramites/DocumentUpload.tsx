'use client'

import { useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Circle,
  FileText,
  ChevronDown,
  ChevronUp,
  Upload,
} from 'lucide-react'

interface UploadedDoc {
  name: string
  url: string
  uploaded_at: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_note?: string
}

interface DocumentUploadProps {
  tramiteId: string
  documentName: string
  documentIndex: number
  currentDoc: UploadedDoc | null
  onUploadComplete: (docData: { name: string; url: string; uploaded_at: string; status: 'pending' }) => void
}

export default function DocumentUpload({
  tramiteId,
  documentName,
  documentIndex,
  currentDoc,
  onUploadComplete,
}: DocumentUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showRejection, setShowRejection] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 10 MB.')
      return
    }

    setUploading(true)
    setProgress(10)

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${tramiteId}/${documentIndex}-${safeName}`

      // Simulate progress while upload happens
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 85))
      }, 300)

      const { data, error } = await supabase.storage
        .from('tramite-documents')
        .upload(path, file, { upsert: true })

      clearInterval(progressInterval)

      if (error) throw error

      setProgress(100)

      const { data: urlData } = supabase.storage
        .from('tramite-documents')
        .getPublicUrl(data.path)

      const docData = {
        name: file.name,
        url: urlData.publicUrl,
        uploaded_at: new Date().toISOString(),
        status: 'pending' as const,
      }

      onUploadComplete(docData)
      toast.success(`"${documentName}" subido correctamente.`)
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al subir el archivo. Inténtalo de nuevo.')
    } finally {
      setUploading(false)
      setProgress(0)
      // Reset input so same file can be re-uploaded
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const triggerUpload = () => fileRef.current?.click()

  const statusDisplay = () => {
    if (!currentDoc) {
      return (
        <div className="flex items-center gap-2 text-slate-400">
          <Circle size={16} />
          <span className="text-sm text-slate-500">Sin documento</span>
        </div>
      )
    }
    if (currentDoc.status === 'pending') {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Clock size={16} />
          <span className="text-sm font-medium">Pendiente revisión</span>
        </div>
      )
    }
    if (currentDoc.status === 'approved') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 size={16} />
          <span className="text-sm font-medium">Aprobado</span>
        </div>
      )
    }
    if (currentDoc.status === 'rejected') {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle size={16} />
          <span className="text-sm font-medium">Rechazado</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
      {/* Document name row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="text-sm font-medium text-slate-800 leading-snug">
            {documentName}
          </span>
        </div>
        {statusDisplay()}
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-slate-400">Subiendo... {progress}%</p>
        </div>
      )}

      {/* Rejection note collapsible */}
      {currentDoc?.status === 'rejected' && currentDoc.rejection_note && (
        <div>
          <button
            type="button"
            onClick={() => setShowRejection((v) => !v)}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            {showRejection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showRejection ? 'Ocultar motivo' : 'Ver motivo de rechazo'}
          </button>
          {showRejection && (
            <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 leading-relaxed">
              {currentDoc.rejection_note}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
          aria-label={`Subir ${documentName}`}
        />

        {(!currentDoc || currentDoc.status === 'rejected') && (
          <Button
            type="button"
            size="sm"
            variant={currentDoc?.status === 'rejected' ? 'outline' : 'default'}
            onClick={triggerUpload}
            disabled={uploading}
            className={cn(currentDoc?.status === 'rejected' && 'border-red-200 text-red-700 hover:bg-red-50')}
          >
            <Upload size={14} />
            {currentDoc?.status === 'rejected' ? 'Re-subir' : 'Subir documento'}
          </Button>
        )}

        {currentDoc && currentDoc.status === 'pending' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={triggerUpload}
            disabled={uploading}
          >
            <Upload size={14} />
            Reemplazar
          </Button>
        )}

        {currentDoc?.url && (
          <a
            href={currentDoc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-700 hover:underline truncate max-w-[180px]"
          >
            {currentDoc.name}
          </a>
        )}
      </div>
    </div>
  )
}
