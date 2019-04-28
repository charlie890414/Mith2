var express = require('express');
const MithVaultSDK = require('../dist/mith-vault-sdk.min.js');
const multer = require('multer');
const path = require('path');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
const menu = require('../models/menu');
const movie = require('../models/movie');
const account = require('../models/account');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

var upload = multer({
  storage: storage
});

const clientId = '0bb0dc2308c147f3a6b9f47aee5fbf5e';
const clientSecret = '6bbd412f129674644d12c075336f1a7285cb586770e904049acc184174e25e66e036427201fab9a6dd2e3df81503e5eafd6750573fd5def49e695bf0d4511c88';
const miningKey = 'cf';
const sdk = new MithVaultSDK({
  clientId,
  clientSecret,
  miningKey
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.post('/login', function (req, res, next) {
  var islogin = req.session.login;
  if (islogin == true) res.redirect('main');
  else {
    account.findOne({
      'account': req.body.account
    }).exec(function (err, result) {
      if (err) {
        res.send("There was a problem finding the information to the database.");
      } else if (result == null || !bcrypt.compareSync(req.body.password, result.password)) {
        res.redirect('/');
      } else {
        req.session.login = true;
        req.session.id = result.id;
        req.session.token = result.token;
        res.redirect('/main');
      }
    });
  }
});

router.post('/signup', function (req, res, next) {
  var islogin = req.session.login;
  if (islogin == true) res.redirect('/main');
  else {
    new account({
      "account": req.body.account,
      "password": bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
      "token": ""
    }).save(function (err, result) {
      if (err) {
        console.log(err);
        res.send("There was a problem adding the information to the database.");
      } else {
        req.session.login = true;
        req.session.id = result.id;
        req.session.token = result.token;
        res.redirect("/main");
      }
    });
  }
});

router.get('/main', function (req, res, next) {
  var islogin = req.session.login;
  console.log(req.session.token);
  if (req.session.token == "") res.redirect('/bindURI');
  else if (islogin == false) res.redirect('/');
  else {
    res.render("main");
  }
});

router.get('/personal_video', function (req, res, next) {
  var islogin = req.session.login;

  if (req.session.token == "") res.redirect('/bindURI');
  else if (islogin == false) res.redirect('/');
  else {
    res.render("personal_video");
  }
});


router.get('/personal_menu', function (req, res, next) {
  var islogin = req.session.login;

  if (req.session.token == "") res.redirect('/bindURI');
  else if (islogin == false) res.redirect('/');
  else {
    res.render("personal_menu");
  }
});

router.get('/getmovielist', function (request, response) {
  movie.find({}).exec(function (err, result) {
    response.status(200).send(result);
  });
});

router.get('/bindURI', function (request, response) {
  const url = sdk.getBindURI();
  response.status(200).redirect(url + "&user_id=" + request.session.id);
});

router.get('/uploads/:id', function (request, response) {
  response.status(200).sendFile(path.resolve("./uploads/" + request.params.id));
});

router.get('/getmovielist', function (request, response) {
  movie.find({}).exec(function (err, result) {
    response.status(200).send(result);
  });
});

router.get('/getmenulist', function (request, response) {
  menu.find({}).exec(function (err, result) {
    response.status(200).send(result);
  });
});

router.get('/delbindURI', function (request, response) {
  account.findOne({
    '_id': request.query.user_id
  }).exec(function (err, result) {
    sdk.delUnbindToken({
      token: result.token
    }).then(data => {
      account.update({
        '_id': request.query.user_id
      }, {
        "token": ""
      }).exec(function (err, result) {
        if (err) {
          response.status(400).send("Error");
        } else {
          response.status(200).send("OK");
        }
      });
    }).catch(error => {
      response.status(400).send("Error");
    });
  });
});

router.get('/postmining', function (request, response) {
  sdk.postUserMiningAction({
    token: request.body.token,
    uuid: _uuid(),
    reward: request.body.reward,
    happenedAt: request.body.happenedAt
  }).then(data => {
    response.send(data);
  });
});

router.post('/uplaodmovie', upload.single('movie'), function (request, response) {
  var file = request.file;
  new movie({
    'owner': request.query.user_id,
    'depend': request.query.menu_id,
    'movie': file.path
  }).save(function (err, results) {
    if (err) {
      console.log(err);
      response.status(400).send("Error");
    } else {
      response.status(200).send("OK");
    }
  });
});

router.post('/createmenu', function (request, response) {
  new menu({
    'owner': request.query.user_id,
    'title': "menu_" + new Date(),
    'follower_amount': 0,
    'like_amount': 7,
    'dislike_amount': 3,
    'movie_amount': 0,
    'content': new Map([
      ["Day1 重訓", "暖身：\n5-10分鐘之心肺運動（50％HRR）\n重訓：\n坐姿胸推（MC）\n坐姿肩推（MC）\n滑輪下拉（MC) \n坐姿划船（MC）\n捲腹（NIC）\n伸展:\n胸大肌\n肱三頭肌\n肱二頭肌\n前三角肌\n中斜方肌\n闊背肌\n腹直肌"],
      ["Day2 有氧暖身", "5分鐘(50％HRR)\n主運動30分鐘(60-75％HRR)\n緩和：5分鐘(50％HRR)"],
      ["Day3 休息", ""],
      ["Day4 重訓", "暖身：\ns5-10分鐘之心肺運動（50％HRR）\n重訓：\n坐姿推蹬（MC）\n坐姿大腿伸張（MC）\n俯臥大腿彎曲（MC）\n舉踵（MC）\n羅馬椅背伸（MC）\n下腹擺腿（MA）\n伸展：\n臀大肌\n股四頭肌\n腿後肌群\n腓腸肌\n豎脊肌\n腹直肌"],
      ["Day5 有氧", "暖身：\n5分鐘50％HRR\n主運動:\n30分鐘60,75％HRR\n緩和：\n5分鐘50％HRR"],
      ["Day6 休息", ""],
      ["Day7 休息", ""],
    ])
  }).save(function (err, results) {
    if (err) {
      response.status(400).send("Error");
    } else {
      response.status(200).send("OK");

    }
  });
});

router.get('/check', function (request, response) {
  account.findOne({
    '_id': request.query.user_id
  }).exec(function (err, result) {
    if (result.token != "") {
      response.status(200).send("OK");
    } else {
      response.status(400).send("Error");
    }
  });
});

router.get('/success', function (request, response) {
  console.log(request.query.grant_code);
  console.log(request.query.state);
  console.log(request.query.user_id);
  sdk.getAccessToken({
    grantCode: request.query.grant_code,
    state: request.query.state
  }).then(data => {
    console.log(data);
    account.update({
      "_id": request.session.id
    }, {
      "token": data.token
    }).exec(function (err) {
      if (err) {
        console.log(err);
        response.status(400).redirect("/");
      } else {
        req.session.token = data.token;
        response.status(200).redirect("/main");
      }
    });
  }).catch(err => {
    console.log(err);
    response.status(400).redirect("/");
  });
});

router.get('/faillure', function (request, response) {
  response.status(400).redirect("/");
});

module.exports = router;