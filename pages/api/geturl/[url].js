
export default async function api(req, res) {
  const { url } = req.query

  console.log(`GETURL:`, url)

  const response = await fetch(url, {})
    .then(r => r)
    // .then(data => data )
    .catch(e => {
      console.warn(`fetch(${url}) EXCEPTION:`, e)
      return res.status(500).json()
    });

  if (!response) {
    console.warn(`fetch(${url}): Null response`)
    return res.status(500).json()
  }

  if (response.status != 200) {
    console.warn(`fetch(${url}) ERROR STATUS [${response.status}]:`)
    return res.status(response.status).json()
  }

  const contentType = response.headers.get("content-type")
  const buffer = await response.arrayBuffer()

  res.setHeader('Content-Type', contentType)
  res.end(new Uint8Array(buffer))
}
