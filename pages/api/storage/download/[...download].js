import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// /api/storage/download/bucket/folder/filename
// /api/storage/download/quest/1/S1W1_chamber
export default async function handler(req, resp) {
  const { download } = req.query
  const [bucket, folder, filename] = download

  if (!bucket || !folder || !filename) {
    return resp.status(400).json({
      error: 'Missing arguments',
      query: req.query,
    })
  }

  const path = `${folder}/${filename}`
  const { data, error } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path)

  if (!data || !data.publicUrl || error) {
    return resp.status(500).json({
      error: error ?? 'Error fetching download path',
      data,
      query: req.query,
    })
  }

  // redirect
  resp.redirect(307, data.publicUrl)
}
