import { hexToString } from 'viem'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY)

// /api/storage/upload/bucket/folder/filename/urlHex
// /api/storage/upload/quest/1/S1W1_chamber/0x68747470733a2f2f687970657273706163652e73746167652e66756e64616f6d656e74616c2e636f6d2f677261766974792e6a7067
// (https://hyperspace.stage.fundaomental.com/gravity.jpg)
export default async function handler(req, resp) {
  const { upload } = req.query
  const [bucket, folder, filename, urlHex] = upload

  if (!bucket || !folder || !filename || !urlHex) {
    return resp.status(400).json({
      error: 'Missing arguments',
      query: req.query,
    })
  }

  const url = hexToString(urlHex)
  const fetchUrl = `${process.env.API_URL}/api/geturl/${urlHex}`

  // Fetch file
  let response = null
  try {
    response = await fetch(fetchUrl, {})
  } catch(error) {
    response = { error }
  }

  if (!response || response.error || response.status != 200) {
    return resp.status(response?.status ?? 400).json({
      error: response?.error ?? `Error fetching file status [${response?.status ?? '?'}]`,
      url,
      fetchUrl,
      query: req.query,
    })
  }

  const contentType = response.headers.get("content-type")
  const buffer = await response.arrayBuffer()

  // https://supabase.com/docs/guides/storage/uploads
  // https://supabase.com/docs/reference/javascript/storage-from-upload
  const path = `${folder}/${filename}`
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })
  console.log(`UPLOAD:`, contentType, data, error)

  if (!data || error) {
    return resp.status(400).json({
      error: error ?? 'Error uploading file',
      query: req.query,
    })
  }

  // Get link from Supabase
  const { data: downloadData } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path)

  const downloadUrl = downloadData?.publicUrl ?? `${process.env.API_URL}/api/storage/download/${bucket}/${folder}/${filename}`
  console.log(`UPLOADED to:`, downloadUrl)

  resp.status(200).json({
    bucket, folder, filename, url,
    data: {
      ...data,
      downloadUrl,
    }
  })
}
