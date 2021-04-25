import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as httpm  from '@actions/http-client';
import * as os from 'os';
import * as fs from 'fs';
import {join} from 'path';

async function run() {
    const http = new httpm.HttpClient('setup-eldev-emacs');
    const isWindows = os.type() === 'Windows_NT';
    const webinstall_script = 'eldev' + (isWindows? ".bat" :"");
    const url = `https://raw.github.com/doublep/eldev/master/webinstall/${webinstall_script}`;
    try {
	core.startGroup('Fetch Eldev');
	const tmpdir = await fs.promises.mkdtemp(join(os.tmpdir(), 'eldev-'));
	const localScript = join(tmpdir, webinstall_script);
	const response = await http.get(url);
	if (response.message.statusCode != 200)  {
	    core.setFailed(`error occured bootstraping from ${url}: ${response.message.statusCode}`);
	    return;
	}
	await fs.promises.writeFile(localScript, await response.readBody());
	if (!isWindows) {
	    await fs.promises.chmod(localScript, fs.constants.S_IXUSR | fs.constants.S_IWUSR | fs.constants.S_IRUSR);
	}
	core.endGroup();
	await exec.exec(localScript);
    } catch (err) {
	core.error(`error occured bootstraping from ${url}: ${err}`);
	console.log("foo");
    }
    const eldevBin = join(isWindows? process.env.USERPROFILE : process.env.HOME,  ".cask", "bin");
    core.addPath(eldevBin);
}

run();
