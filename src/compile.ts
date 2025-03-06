import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';

export default function compile(solcPath: string, input: string) {
  return new Promise<string>((resolve, reject) => {
    const solc = spawn(solcPath, ['--standard-json']);
      const streamToText = (s: Readable) =>
        s
          .setEncoding('utf8')
          .toArray()
          .then((chunks) => chunks.join(''));

         solc.stdin.end(input);
         const outPromise = streamToText(solc.stdout)
         const errorPromise = streamToText(solc.stderr)

    solc.once('close', (code) => {
      return code === 0 ? outPromise.then(resolve) : errorPromise.then(e => reject(new Error(e)));
    });
  });
}
