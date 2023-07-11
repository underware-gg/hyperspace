import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export default async function handler(req, resp) {
  const { db } = req.query
  const [api, slug] = db

  let result = null

  // Get all room slugs
  // http://localhost:3000/api/db/rooms
  if (api == 'rooms') {
    const { data, error } = await supabase
      .from('rooms')
      .select('slug')
    result = data ? data.map(v => v.slug) : { error }
  }
  
  // get a room's data
  // http://localhost:3000/api/db/room/test
  if (api == 'room') {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('slug', slug)
    result = data ?? { error }
  }

  if (result) {
    if (result.error) {
      return resp.status(400).json({
        error: result.error,
        query: req.query,
      })
    }
    return resp.status(200).json(result)
  }

  // bad request
  resp.status(400).json({
    error: 'Bad api call [' + api + ']',
    query: req.query,
  })
}
