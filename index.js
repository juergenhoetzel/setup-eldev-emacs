const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');
const os = require('os');
const fs = require('fs');
const {join} = require('path');

async function run() {
    const isWindows = os.type() === 'Windows_NT';
    const webinstall_script = 'eldev' + (isWindows? ".bat" :"");
    const url = `https://raw.github.com/doublep/eldev/master/webinstall/${webinstall_script}`;
    try {
	core.startGroup('Fetch Eldev');
	const localScript = await tc.downloadTool(url, join(os.tmpdir(), webinstall_script));
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
