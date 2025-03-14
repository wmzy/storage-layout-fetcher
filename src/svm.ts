import * as fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as os from 'node:os';
import { Readable, Writable } from 'node:stream';
import * as semver from 'semver';
import * as ff from 'fetch-fun';

import { SolcArtifact, SolcBuildInfo } from './types';
import { pipeline } from 'node:stream/promises';

const BASE_URL = '//binaries.soliditylang.org';
const LINUX_AMD64 = 'linux-amd64';
const MACOSX_AMD64 = 'macosx-amd64';
const WINDOWS_AMD64 = 'windows-amd64';
const EMSCRIPTEN_WASM32 = 'emscripten-wasm32';

function getPlatform() {
  switch (os.platform()) {
    case 'linux':
      return LINUX_AMD64;
    case 'darwin':
      return MACOSX_AMD64;
    case 'win32':
      return WINDOWS_AMD64;
    default:
      return EMSCRIPTEN_WASM32;
  }
}

async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function install(version: string, dir: string) {
  const binaryPath = getBinaryPath(dir);
  try {
    await fs.access(binaryPath);
    return binaryPath;
  } catch {}

  const artifact = await getArtifact(version);

  if (!artifact) {
    throw new Error(`Artifact for version '${version}' not found`);
  }

  await ensureDir(dir);

  try {
    return await downloadFile(artifact, dir);
  } catch {
    return await downloadFile(artifact, dir, 'https');
  }
}

const buildByVersion: Map<string, SolcBuildInfo> = new Map();
let latestRelease = '0.0.0';
export async function getArtifact(version: string) {
  if (semver.gt(version, latestRelease)) {
    const platform = getPlatform();
    const artifactList = await ff
      .create()
      .with(ff.retry, 3)
      .with(ff.url, `https:${BASE_URL}/${platform}/list.json`)
      .pipe(ff.fetchJSON<SolcArtifact>);
    latestRelease = artifactList.latestRelease;
    artifactList.builds.forEach((a) => buildByVersion.set(a.version, a));
  }
  return buildByVersion.get(version);
}

// TODO: retry
async function downloadFile(
  artifact: SolcBuildInfo,
  dir: string,
  protocol: 'https' | 'http' = 'http'
) {
  const platform = getPlatform();
  const url = `${BASE_URL}/${platform}/${artifact.path}`;
  const response = await fetch(`${protocol}:${url}`);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}`);
  }
  const solcDownloadFile = path.join(dir, `solc-${Date.now()}.download`);
  const dest = createWriteStream(solcDownloadFile, { mode: 0o755 });
  if (!response.body) throw new Error('Response body is undefined');

  if (protocol === 'https') {
    await response.body.pipeTo(Writable.toWeb(dest));
  } else {
    // calculate sha256 checksum and write to file
    const sha256 = crypto.createHash('sha256');
    const [readable1, readable2] = response.body.tee();

    await Promise.all([
      pipeline(Readable.fromWeb(readable1 as any), sha256),
      readable2.pipeTo(Writable.toWeb(dest)),
    ]);
    const checksum = sha256.digest('hex');
    if (checksum !== artifact.sha256.slice(2)) {
      throw new Error(`Checksum mismatch for ${artifact.version}`);
    }
  }

  const binaryPath = getBinaryPath(dir);
  await fs.rename(solcDownloadFile, binaryPath);
  return binaryPath;
}

export function getBinaryPath(dir: string) {
  return path.join(dir, 'solc');
}
