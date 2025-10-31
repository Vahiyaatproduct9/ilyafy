import RNFB from 'react-native-blob-util'
export default async (ytUrl: string): Promise<{ localPath: string, headers: any } | undefined> => {
    // const serverUrl = `http://localhost:8080/stream/?url=${encodeURIComponent(ytUrl)}`
    const serverUrl = `https://ilyafy.onrender.com/stream/?url=${encodeURIComponent(ytUrl)}`
    const localPath = `${RNFB.fs.dirs.CacheDir}/${Date.now()}.aac`
    console.log('local path:', localPath)
    try {
        if (await RNFB.fs.exists(localPath)) await RNFB.fs.unlink(localPath)
        let started = false;
        let minBuffer = 256 * 1024;
        return new Promise((resolve, reject) => {
            const task = RNFB.config({
                path: localPath,
                fileCache: true,
                appendExt: 'aac',
            }).fetch('GET', serverUrl)
            let headers: any = null;

            task.progress({ interval: 100 }, async (recieved, _) => {
                if (!started && recieved > minBuffer && headers) {
                    console.log('Buffer Ready..');
                    started = true;
                    resolve({ localPath, headers })
                }
            })
            task.then(res => {
                headers = res.info().headers;
                console.log('Download Complete!', res.path())
                resolve({ localPath, headers })
            })
                .catch(err => {
                    console.error('Download Error: ', err)
                    if (!started) reject(err)
                })
        })
    }
    catch (err) {
        console.log('Error in saveAndStream: ', err)
    }
}