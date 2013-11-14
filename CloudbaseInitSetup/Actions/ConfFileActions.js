// Copyright (c) 2012 Cloudbase Solutions Srl. All rights reserved.

// Begin common utils (as there's no practival way to include a separate script)

// Awful workaround to include common js features
var commonIncludeFileName = "82311161-875A-4587-A86C-9784581D8F56.js";
function loadCommonIncludeFile(fileName) {
    var shell = new ActiveXObject("WScript.Shell");
    var windir = shell.ExpandEnvironmentStrings("%WINDIR%");
    var path = windir + "\\Temp\\" + fileName;
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    return fso.OpenTextFile(path, 1).ReadAll();
}
eval(loadCommonIncludeFile(commonIncludeFileName));
// End workaround

function checkBoxValueToBool(str) {
    return (str && str.length > 0 ? true : false).toString();
}

function writeConfigFile(path, config) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var fs = fso.OpenTextFile(path, 2, true);

    logMessage("Writing file " + path);

    fs.WriteLine("[DEFAULT]");
    for (var k in config)
        fs.WriteLine(k + "=" + config[k]);
    fs.Close();
}

function writeCloudbaseInitConfFileAction() {
    try {
        logMessage("Writing cloudbase-init.conf file");

        var data = Session.Property("CustomActionData").split('|');

        var i = 0;
        var cloudbaseInitConfFolder = data[i++];
        var logFolder = data[i++];
        var userName = data[i++];
        var injectMetadataPassword = data[i++];
        var userGroups = data[i++];
        var networkAdapterName = data[i++];

        var cloudbaseInitConfFile = cloudbaseInitConfFolder + "cloudbase-init.conf";

        var config = {
            "username": trim(userName),
            "groups": trim(userGroups),
            "inject_user_password": checkBoxValueToBool(injectMetadataPassword),
            "network_adapter": trim(networkAdapterName),
            "config_drive_raw_hhd": "true",
            "config_drive_cdrom": "true",
            "verbose": "true",
            "logdir": trim(logFolder),
            "logfile": "cloudbase-init.log"
        };

        writeConfigFile(cloudbaseInitConfFile, config);

        var cloudbaseInitConfFileUnattend = cloudbaseInitConfFolder + "cloudbase-init-unattend.conf";

        var config = {
            "plugins": "cloudbaseinit.plugins.windows.sethostname.SetHostNamePlugin",
            "metadata_services": "cloudbaseinit.metadata.services.configdrive.configdrive.ConfigDriveService,cloudbaseinit.metadata.services.httpservice.HttpService,cloudbaseinit.metadata.services.ec2service.EC2Service",
            "allow_reboot": false,
            "config_drive_raw_hhd": "false",
            "config_drive_cdrom": "true",
            "verbose": "true",
            "logdir": trim(logFolder),
            "logfile": "cloudbase-init.log"
        };

        writeConfigFile(cloudbaseInitConfFileUnattend, config);

        return MsiActionStatus.Ok;
    }
    catch (ex) {
        logException(ex);
        return MsiActionStatus.Abort;
    }
}