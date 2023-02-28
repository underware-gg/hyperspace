
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://kegzdrlxljinsutbdfla.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZ3pkcmx4bGppbnN1dGJkZmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njg3NDEzNzksImV4cCI6MTk4NDMxNzM3OX0.Qg--vv50J4XbmSkgIC_XLB5f-m6o8_iqUNCBaDe_35o')

export default async function handler(request, response) {
  const { db } = request.query;
  const [api, slug] = db;

  let result = null;

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
      return response.status(400).json({
        error: result.error,
        query: request.query,
      });
    }
    return response.status(200).json(result);
  }

  // bad request
  response.status(400).json({
    error: 'Bad api call [' + api + ']',
    query: request.query,
  });
}
