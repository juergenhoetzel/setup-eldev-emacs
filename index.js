const core = require('@actions/core');
const exec = require('@actions/exec');
const httpm = require('@actions/http-client');
const os = require('os');
const fs = require('fs');
const {join} = require('path');

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
	await exec.exec(localScript, ['https://raw.githubusercontent.com/doublep/eldev/master/bin/eldev.bat']);
    } catch (err) {
	core.error(`error occured bootstraping from ${url}: ${err}`);
    }
    const eldevBin = join(isWindows? process.env.USERPROFILE : process.env.HOME,  ".eldev", "bin");
    core.startGroup(`Adding ${eldevBin} to PATH`);
    core.addPath(eldevBin);
    core.Endgroup();
}

run();
