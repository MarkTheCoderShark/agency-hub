import { supabase } from './client'
import { generateId } from '@/lib/utils'

const ATTACHMENTS_BUCKET = 'attachments'
const LOGOS_BUCKET = 'logos'
const AVATARS_BUCKET = 'avatars'

export interface UploadResult {
  path: string
  url: string
}

// Upload attachment file
export async function uploadAttachment(
  file: File,
  agencyId: string
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${generateId()}.${fileExt}`
  const filePath = `${agencyId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .getPublicUrl(filePath)

  return {
    path: filePath,
    url: urlData.publicUrl,
  }
}

// Delete attachment file
export async function deleteAttachment(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .remove([filePath])

  if (error) throw error
}

// Upload agency logo
export async function uploadLogo(
  file: File,
  agencyId: string
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${agencyId}.${fileExt}`

  // Delete existing logo first (if any)
  await supabase.storage.from(LOGOS_BUCKET).remove([fileName])

  const { error: uploadError } = await supabase.storage
    .from(LOGOS_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from(LOGOS_BUCKET)
    .getPublicUrl(fileName)

  return {
    path: fileName,
    url: urlData.publicUrl,
  }
}

// Delete agency logo
export async function deleteLogo(agencyId: string): Promise<void> {
  const { data: files } = await supabase.storage
    .from(LOGOS_BUCKET)
    .list('', {
      search: agencyId,
    })

  if (files && files.length > 0) {
    const filesToDelete = files.map((f) => f.name)
    await supabase.storage.from(LOGOS_BUCKET).remove(filesToDelete)
  }
}

// Upload user avatar
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}.${fileExt}`

  // Delete existing avatar first (if any)
  await supabase.storage.from(AVATARS_BUCKET).remove([fileName])

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(fileName)

  return {
    path: fileName,
    url: urlData.publicUrl,
  }
}

// Delete user avatar
export async function deleteAvatar(userId: string): Promise<void> {
  const { data: files } = await supabase.storage
    .from(AVATARS_BUCKET)
    .list('', {
      search: userId,
    })

  if (files && files.length > 0) {
    const filesToDelete = files.map((f) => f.name)
    await supabase.storage.from(AVATARS_BUCKET).remove(filesToDelete)
  }
}

// Get signed URL for private file
export async function getSignedUrl(
  bucket: string,
  filePath: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn)

  if (error) throw error
  return data.signedUrl
}

// Save attachment record to database
export async function saveAttachmentRecord(data: {
  request_id?: string
  message_id?: string
  note_id?: string
  file_name: string
  file_path: string
  file_url: string
  file_size: number
  file_type: string
  uploaded_by: string
}) {
  const { data: attachment, error } = await supabase
    .from('attachments')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return attachment
}

// Delete attachment record from database
export async function deleteAttachmentRecord(attachmentId: string) {
  // Get the attachment first to get the file path
  const { data: attachment, error: fetchError } = await supabase
    .from('attachments')
    .select('file_path')
    .eq('id', attachmentId)
    .single()

  if (fetchError) throw fetchError

  // Delete from storage
  if (attachment?.file_path) {
    await deleteAttachment(attachment.file_path)
  }

  // Delete record
  const { error } = await supabase
    .from('attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) throw error
}
