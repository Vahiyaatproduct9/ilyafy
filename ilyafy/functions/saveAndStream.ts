import RNFB from 'react-native-blob-util'

export default async function saveAndStream(
    ytUrl: string
): Promise<{ localPath: string; headers: any; metadata: undefined | any; } | undefined> {
    // const serverUrl = `http://localhost:8080/stream/?url=${encodeURIComponent(ytUrl)}`
    // const serverUrl = `https://ilyafy.onrender.com/stream/?url=${encodeURIComponent(ytUrl)}`
    const serverUrl = `https://ilyafy-2.onrender.com/stream/?url=${encodeURIComponent(ytUrl)}`
    const localPath = `${RNFB.fs.dirs.CacheDir}/${Date.now()}.aac`

    try {
        if (await RNFB.fs.exists(localPath)) await RNFB.fs.unlink(localPath)

        // First, do a HEAD or light GET to detect response type
        const headRes = await fetch(serverUrl, { method: 'GET' })
        const contentType = headRes.headers.get('Content-Type') || ''

        // CASE 1: Direct URL mode
        if (contentType.includes('application/json')) {
            const json = await headRes.json()
            console.log('json: ', json)
            return new Promise((resolve, reject) => {
                if (json.success && json.url) {
                    console.log('Direct URL mode:', json.url)
                    resolve({ localPath: json.url, headers: headRes.headers, metadata: json })
                    const saveAudio = async () => {
                        await RNFB.config({ path: localPath }).fetch('GET', json.url)
                        console.log('Downloaded to:', localPath)
                    }
                    saveAudio()
                } else {
                    reject(new Error('Invalid JSON response from stream API'))
                }
            })
        }

        // CASE 2: Raw stream mode
        console.log('Streaming chunks to:', localPath)
        let started = false
        let headers: any = null
        const minBuffer = 256 * 1024 // 256KB

        return new Promise((resolve, reject) => {
            const task = RNFB.config({
                path: localPath,
                fileCache: true,
                appendExt: 'aac',
            }).fetch('GET', serverUrl)

            task.progress({ interval: 100 }, (received) => {
                if (!started && received > minBuffer) {
                    started = true
                    console.log('Buffer ready...')
                    resolve({ localPath, headers, metadata: undefined })
                }
            })

            task
                .then((res) => {
                    headers = res.info().headers
                    console.log('Download complete:', res.path())
                    if (!started) resolve({ localPath, headers, metadata: undefined })
                })
                .catch((err) => {
                    console.error('Download Error:', err)
                    if (!started) reject(err)
                })
        })
    } catch (err) {
        console.error('Error in saveAndStream:', err)
    }
}
