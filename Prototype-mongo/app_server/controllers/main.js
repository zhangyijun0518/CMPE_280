var readline = require('readline');
var fs = require('fs');
var isWin = process.platform === 'win32';
var projectFolerName = isWin ? 'Prototype-mongo/' : '';
var registeredUsers = [];
var favCollegeList = new Map();
var modelMain = require("../models/modelMain");

favCollegeList.set("San Jose State University", 1);
favCollegeList.set("Stanford University", 2);
favCollegeList.set("University of California, Berkeley", 3);

module.exports.get_register = function(req, res) {
    sendPage(projectFolerName + 'public/html/loginAndRegister.html', res);
};

module.exports.get_admin = function(req, res) {
    sendPage(projectFolerName + 'public/html/admin.html', res);
};

module.exports.get_homePage = function(req, res) {
    sendPage(projectFolerName + 'public/html/home.html', res);
};

module.exports.post_register = function(req, res) {
    console.log('register called');
    if (!req.body.username || !req.body.password) {
        res.send("Missing Username or Password for Registration!");
    } else {
        var matches = registeredUsers.filter(function(user) {
            return user.username == req.body.username;
        });
        if (matches.length > 0) {
            res.send("username has been registered. use another username or try login");
        } else {
            var newUser = {
                username: req.body.username,
                password: req.body.password
            };
            registeredUsers.push(newUser);
            req.session.user = newUser;
            console.log('new user registered : ' + newUser.username);
            res.redirect('/home');
        }
    }
};

module.exports.post_login = function(req, res) {
    console.log('login called');
    var matches = registeredUsers.filter(function(user) {
        return user.username == req.body.username && user.password == req.body.password;
    });
    if (matches.length == 0) {
        res.send('wrong username or password');
    } else {
        req.session.user = matches[0];
        res.redirect('/home');
    }
};

module.exports.get_logout = function(req, res) {
    if (req.session.user) {
        req.session.destroy(function() {
            console.log('session refreshed');
        });
    }
    res.redirect('/');
};

module.exports.check_logged_In = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.send("must log in first");
    }
};



module.exports.get_collegeInfo = function(req, res) {
    console.log("finding college");
    var schoolName = req.param('schoolName');
    if (schoolName == "SJSU" || schoolName == "sjsu" || schoolName == "San Jose State University") {
        req.body.universityName = "sanjosestate";
        modelMain.findUniversityData(req, res);
    } else if (schoolName == "Stanford" || schoolName == "stanford" || schoolName == "Stanford University") {
        req.body.universityName = "stanford";
        modelMain.findUniversityData(req, res);
    } else if (schoolName == "UCB" || schoolName == "ucb" || schoolName == "University of California, Berkeley" || schoolName == "berkeley") {
        req.body.universityName = "berkeley";
        modelMain.findUniversityData(req, res);
    } else {
        sendPage(projectFolerName + 'public/html/error.html', res);
    }
};


module.exports.post_adminOperation = function(req, res) {
     var operate  = req.body.adminOperation;
     console.log("receive operation:"  + operate);
     switch(operate) {
         case "add":
             modelMain.addUniversityData(req, res);
             break;
         case "update":
             modelMain.updateUniversityData(req, res);
             break;
         case "delete":
             modelMain.deleteUniversityData(req, res);
             break;
         default:
     }
}


module.exports.get_overview = function(req, res) {
    sendPage(projectFolerName + 'public/html/overview.html', res);
};

function sendPage(filename, res) {
    var html = '';
    var readInterface = readline.createInterface({
        input: fs.createReadStream(filename),
        output: process.stdout,
        console: false
    });
    //readInterface is async
    readInterface.on('line', function(line) {
        html += line + '\n';
    }).on('close', function() {
        res.send(html);
    });
}

function sendPageOld(fileName, result) {
    var html = '';
    lineReader.eachLine(fileName, function(line, last) {
        html += line + '\n';
        if (last) {
            result.send(html);
            return false;
        } else {
            return true;
        }
    });
}
