import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY)

// /api/storage/upload/bucket/folder/filename/url
// /api/storage/upload/quest/1/S1W1_chamber/https%3A%2F%2Foaidalleapiprodscus.blob.core.windows.net%2Fprivate%2Forg-mSNe7tyaKphe2CUIGBgtXtDj%2Fuser-F21Se6rQxZOAZcEz7huLijvZ%2Fimg-I4WVJ4SUsSUGOo8FDzBegXp1.png
export default async function handler(req, resp) {
  const { upload } = req.query
  const [bucket, folder, filename, url] = upload

  if (!bucket || !folder || !filename || !url) {
    return resp.status(400).json({
      error: 'Missing arguments',
      query: req.query,
    })
  }

  // Fetch file
  const fetchUrl = `${process.env.API_URL}/api/geturl/${encodeURIComponent(url)}`
  const response = await fetch(fetchUrl, {})

  if(!response || response.status != 200) {
    return resp.status(response?.status ?? 400).json({
      error: 'Error fetching file',
      fetchUrl,
      query: req.query,
    })
  }

  const contentType = response.headers.get("content-type")
  const buffer = await response.arrayBuffer()

  // https://supabase.com/docs/guides/storage/uploads
  // https://supabase.com/docs/reference/javascript/storage-from-upload
  const path = `${folder}/${filename}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })
  console.log(`UPLOAD:`, contentType, data, error)

  if (!data || error) {
    return resp.status(500).json({
      error: error ?? 'Error uploading file',
      query: req.query,
    })
  }

  const downloadUrl = `${process.env.API_URL}/api/storage/download/${bucket}/${folder}/${filename}`
  console.log(`UPLOADED to:`, downloadUrl)

  resp.status(200).json({
    bucket, folder, filename, url,
    data: {
      ...data,
      downloadUrl,
    }
  })
}
