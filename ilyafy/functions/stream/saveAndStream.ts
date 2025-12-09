import RNFB from 'react-native-blob-util'
import { domain } from '../../path/path';

export default async function saveAndStream(
    ytUrl: string
): Promise<{ localPath: string; headers: any; metadata: undefined | any; } | undefined> {
    const serverUrl = `${domain}/stream?url=${encodeURIComponent(ytUrl)}`
    const localPath = `${RNFB.fs.dirs.CacheDir}/${Date.now()}.aac`

    try {
        if (await RNFB.fs.exists(localPath)) await RNFB.fs.unlink(localPath)
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
                console.info(`Downloaded ${received} bytes`);
                if (received >= minBuffer && !started) {
                    started = true
                    console.log('Buffer ready...')
                }
            })
            task
                .then(async (res) => {
                    headers = await res.info().headers;
                    const info = await res.json();
                    console.log('info: ', info);
                    console.log('Headers:', headers)
                    if (headers['Content-Type'].includes('application/json')) {
                        console.log('Meta Mode:', res.path())
                        return resolve({ localPath: info.url, headers, metadata: info });
                    } else {
                        console.log('Buffer Mode.');
                        return resolve({ localPath: res.path(), headers, metadata: undefined });
                    }
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
