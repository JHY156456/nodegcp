var express = require('express');
var formidable = require('formidable');

var router = express.Router();
//member/:phone,회원정보반환 함수(메일로 / 이전것)
var email = function (req, res, next) { //router.get('/:phone', function(req, res, next) {
    var email = req.params.email;

    var database = req.app.get('database');
    if (database.db) {
        database.UserModel.findByMail(email, function (err, results) {
            if (err) {
                console.error('회원정보 반환 중 오류 발생 :' + err.stack);
                callback(err, null);
                res.end();
                return;
            }
            if (results.length > 0) {
                res.json(results[0]);
                res.end();
            } else {
                res.sendStatus(400);
                res.end();
            }
        });
    }
}
/*
//member/:phone,회원정보반환 함수(폰번호로 / 이전것)
var phone = function (req, res, next) { //router.get('/:phone', function(req, res, next) {
    console.log('어디가 문제지');
    var phone = req.params.phone;

    var database = req.app.get('database');
    if (database.db) {
        database.UserModel.findByPhone(phone, function (err, results) {
            if (err) {
                console.error('회원정보 반환 중 오류 발생 :' + err.stack);
                callback(err, null);
                res.end();
                return;
            }
            if (results.length > 0) {
                console.log('화가나염');
                console.log(results[0].name);
                console.log(results[0].phone);
                res.json(results[0]);
                res.end();

            } else {
                res.sendStatus(400);
                res.end();
            }
        });
    }
}
*/
//member/phone,회원전화번호 저장함수
var member_phone = function (req, res) { //router.post('/phone', function(req, res) {
    var phone = req.body.phone;
    var database = req.app.get('database');
    var index;
    if (database.db) {
        addmember_phone(database, phone, function (err, result, index) {
            if (err) {
                console.error('핸드폰 추가 중 에러 발생 : ' + err.stack);

                console.log('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                console.log('<h2>핸드폰 추가 중 에러 발생</h2>');
                console.log('<p>' + err.stack + '</p>');
                res.end();
                return;
            }

            if (index == 1) { //핸드폰이 저장되어있다면 경우 1을 콜백으로 result받음
                return res.sendStatus(400);
                console.log('<h2>핸드폰 추가 성공</h2>');
                res.end();
            } else if (index == 2) { // 새로저장하고 리턴받은result
                res.status(200).send('' + result.insertId);
                res.end();
            }
        });
    } else {

        console.log('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
}


//member/info
var member_info = function (req, res) { //router.post('/info', function(req, res) {
    var phone = req.body.phone;
    var name = req.body.name;
    var sextype = req.body.sextype;
    var birthday = req.body.birthday;

    console.log(name, sextype, birthday, phone);
    var database = req.app.get('database');

    if (database.db) {
        addmember(database, phone, name, sextype, birthday, function (err, result) {
            if (err) {
                console.error('핸드폰 추가 중 에러 발생 : ' + err.stack);
                console.log('<h2>핸드폰 추가 중 에러 발생</h2>');
                console.log('<p>' + err.stack + '</p>');
                res.end();
                return;
            }

            if (result) {
                console.log('멤버 추가 성공');
                console.log('seq?? : ' + result.seq);
                res.status(200).send('' + result.seq);
                res.end();
            } else {
                console.log.write('<h2>핸드폰 추가  실패</h2>');
                res.end();
            }
        });
    } else {
        console.log('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
}
//member/icon_upload
var member_icon_upload = function (req, res) { //router.post('/icon_upload', function (req, res) {
    var form = new formidable.IncomingForm();

    form.on('fileBegin', function (name, file) {
        file.path = './public/member/' + file.name;
    });

    form.parse(req, function (err, fields, files) {
        var sql_update = "update bestfood_member set member_icon_filename = ? where seq = ?;";

        db.get().query(sql_update, [files.file.name, fields.member_seq], function (err, rows) {
            res.sendStatus(200);
        });
    });
}

var addmember_phone = function (database, phone, callback) {
    console.log('addmember_phone 호출됨.');

    database.UserModel.findByPhone(phone, function (err, results) {
        if (err) {
            console.error('에러얌 :' + err.stack);
            callback(err, null);
            return;
        }
        if (results.length > 0) {
            callback(null, results, 1);
        } else {
            var mem = new database.UserModel({
                phone: phone
            });

            // save()로 저장
            mem.save(function (err) {
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log("새롭게.");
                callback(null, mem, 2);
            });
        }
    });
}
var addmember = function (database, phone, name, sextype, birthday, callback) {
    console.log('addmember 호출됨.');
    // bestfood_member 인스턴스 생성
    database.UserModel.findByPhone(phone, function (err, results) {
        if (err) {
            console.error('에러얌 :' + err.stack);
            callback(err, null);
            return;
        }
        if (results.length > 0) {
            database.UserModel.where({
                phone: phone
            }).update({
                name: name,
                birthday: birthday,
                sextype: sextype
            }, function (err) {
                if (err) {
                    callback(err, null);
                    return;
                }
            });
            callback(null, results[0]);

        } else {
            var mem = new database.UserModel({
                "phone": phone,
                "name": name,
                "sextype": sextype,
                "birthday": birthday
            });
            mem.save(function (err) {
                if (err) {
                    callback(err, null);
                    return;
                }
                console.log("멤버 데이터 추가함.");
                callback(null, mem);
            });
        }
    });
}
module.exports.email = email;
module.exports.member_phone = member_phone;
module.exports.member_info = member_info;
module.exports.member_icon_upload = member_icon_upload;