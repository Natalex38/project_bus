var express = require('express');
var http = require('http');
var httpProxy = require('http-proxy');
var proxy = require('express-http-proxy');
var request = require('request');
var mysql = require('mysql');
//var fetch = require("fetch");

var router = express.Router();

router.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Origin", "http://www.irkbus.ru");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

let PHPSESSID = '700n1t0vnob2jntv12fhnfrdk6';

//router.use('/proxy', async (req, res, next) => {
//  let data = await fetch("http://www.irkbus.ru/", {"credentials":"include","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3","accept-language":"ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7","cache-control":"max-age=0","upgrade-insecure-requests":"1"},"referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"});
//  console.log(data.headers.get('cookie'));
//  next();
//});

const url = '/php/getVehiclesMarkers.php?rids=1-1,2-1,19-0,20-0,4-1,3-1,283-0,282-0,344-0,343-0,233-0,232-0,6-0,5-0,5-1,10-1,11-1,9-1,8-1,348-0,347-0,84-0,83-0,2-0,1-0,201-0,202-0,128-0,129-0,394-0,395-0,6-1,7-1,214-0,215-0,12-1,18-0,17-0,4-0,3-0,11-0,12-0,24-0,23-0,10-0,9-0,63-0,62-0,308-0,309-0,60-0,61-0,13-0,14-0,297-0,296-0,242-0,243-0,16-0,15-0,25-0,26-0,64-0,65-0,311-0,310-0,346-0,68-0,69-0,27-0,28-0,73-0,72-0,52-0,53-0,278-0,279-0,332-0,36-0,37-0,360-0,361-0,234-0,235-0,398-0,399-0,228-0,229-0,127-0,126-0,298-0,299-0,301-0,300-0,78-0,77-0,125-0,124-0,79-0,80-0,81-0,82-0,302-0,303-0,401-0,400-0,31-0,30-0,222-0,223-0,207-0,206-0,224-0,225-0,208-0,209-0,351-0,350-0,352-0,353-0,240-0,241-0,286-0,287-0,227-0,226-0,210-0,211-0,216-0,217-0,218-0,219-0,338-0,337-0,43-0,42-0,396-0,397-0,336-0,335-0,408-0,355-0,354-0,237-0,236-0,220-0,221-0,327-0,326-0,49-0,48-0,313-0,312-0,314-0,293-0,292-0,304-0,305-0,345-0,47-0,46-0,291-0,290-0,32-0,33-0,212-0,213-0,316-0,315-0,342-0,341-0,203-0,22-0,21-0,38-0,230-0,231-0,340-0,339-0,324-0,323-0,280-0,281-0,123-0,239-0,238-0,321-0,390-0,391-0,392-0,393-0,358-0,359-0,362-0,363-0,365-0,364-0,369-0,368-0,367-0,366-0,388-0,389-0,370-0,371-0,372-0,373-0,374-0,375-0,376-0,377-0,403-0,402-0,379-0,378-0,380-0,381-0,406-0,407-0,382-0,383-0,384-0,385-0,386-0,387-0,405-0,404-0,349-0,357-0,356-0,67-0,66-0,334-0,333-0&lat0=0&lng0=0&lat1=90&lng1=180&curk=0&city=irkutsk&info=12345&_=1582961714602';

router.use('/proxy', proxy('www.irkbus.ru', {
   proxyReqPathResolver: function (req) {
    return url;
  },
  proxyReqOptDecorator(proxyReqOpts, srcReq) {
    //вывод заголовков
    //console.log(proxyReqOpts.headers);
    //установление заголовка cookie
  //  proxyReqOpts.headers.Connection = `keep-alive`;
    proxyReqOpts.headers.cookie = `PHPSESSID=${PHPSESSID}; `;
    return proxyReqOpts;
  },
  //очень хорошая функция предназначенная для измения полученных данных перед отправкой клиенту, но будет использоваться для записи данных в БД
  userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
    data = JSON.parse(proxyResData.toString('utf8'));
    //data.newProperty = 'exciting data';
    console.log(JSON.stringify(data.anims[0].lat/1000000));
    return JSON.stringify(data);
  }
}));

const url2 = '/php/getVehicleForecasts.php?vid=5328&type=0&city=irkutsk&info=12345&_=1557563187437';

router.use('/proxy_mysql_ost', proxy('www.irkbus.ru', {
   proxyReqPathResolver: function (req) {
    return url2;
  },
  proxyReqOptDecorator(proxyReqOpts, srcReq) {
    proxyReqOpts.headers.cookie = `PHPSESSID=${PHPSESSID}; `;
    return proxyReqOpts;
  },
  userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
    data = JSON.parse(proxyResData.toString('utf8'));
    console.log(JSON.stringify(data));
    var stid=0;
    var name=0;
    var lat=0;
    var lon=0;
    var ans=0;
    //конект с БД
    console.log('Get connection ...');
    var conn = mysql.createConnection({
      database: 'station',
      host: "127.0.0.1",
      user: "root",
      password: "alexis"
    });
    conn.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
console.log(data.length);
for(var i=0; i<data.length;i++){
    stid=data[i].stid;
    name=data[i].stname;
    lat=data[i].lat0/1000000;
    lon=data[i].lng0/1000000;

   console.log(stid,"  ",i);
  var query = conn.query('SELECT*FROM station WHERE stid=?',data[i].stid, function(err, result) {
    if (err) console.log(err);
    ans=result.length;
  });
  var query = conn.query('INSERT INTO station(stid,stname,lat,lon) values(?,?,?,?)',[stid,name,lat,lon], function(err, result) {
    if (err) console.log(err);
  });
  console.log(query.sql);
 }
    conn.end();
    return JSON.stringify(data);

  }
}));

router.use('/ost_show', function(req, res) {
  console.log('Get connection ...');
  var conn = mysql.createConnection({
    database: 'station',
    host: "127.0.0.1",
    user: "root",
    password: "alexis"
  });
  conn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
  var query = conn.query('SELECT*FROM station',function(err, result) {
    if (err) console.log(err);
    json = JSON.stringify(result);
    res.send(json);
    return json;
  });
});

const url3 = '/php/getVehicleForecasts.php?vid=2611&type=0&city=irkutsk&info=12345&_=1557205943040';

router.use('/parse_mysql_rout', proxy('www.irkbus.ru', {
   proxyReqPathResolver: function (req) {
    return url3;
  },
  proxyReqOptDecorator(proxyReqOpts, srcReq) {
    proxyReqOpts.headers.cookie = `PHPSESSID=${PHPSESSID}; `;
    return proxyReqOpts;
  },
  userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
    data = JSON.parse(proxyResData.toString('utf8'));
    console.log(JSON.stringify(data));
    var id_rt=0;
    var visit=0;
    var id_ost=0;
    //конект с БД
    console.log('Get connection ...');
    var conn = mysql.createConnection({
      database: 'station',
      host: "127.0.0.1",
      user: "root",
      password: "alexis"
    });
    conn.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
//for(var i=0; i<data.length;i++){
    id_rt=3;
    visit=0;
    id_ost=47;
    console.log(id_rt,' ',visit,' ',id_ost);
  /*var query = conn.query('SELECT*FROM rout WHERE id_tr=?',data[i].stid, function(err, result) {
    if (err) console.log(err);
  });*/
  var query = conn.query('INSERT INTO rout(id_rt,visit,id_ost) values(?,?,?)',[id_tr,visit,id_ost], function(err, result) {
    if (err) console.log(err);
  });
  console.log(query.sql);
  //}
  console.log(id_rt,' ',visit,' ',id_ost);
    conn.end();
    return JSON.stringify(data);
   }
}));
router.use('/print_mysql_rout', function(req, res) {
    //конект с БД
    console.log('Get connection ...');
    var conn = mysql.createConnection({
      database: 'station',
      host: "127.0.0.1",
      user: "root",
      password: "alexis"
    });
    conn.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
var ost=[72,74,75,77,87,105,106,108,111,113,116,117,119,121,123,125,31,34,35,37,41,44,45,24,127,42,40,38,36,33,32,124,122,120,118,115,114,112,110,109,107,88,86,102,79,77,75,73,71];
for(var i=0; i<ost.length;i++){
//console.log(ost[i]);
var query = conn.query('INSERT INTO rout(id_tr,visit,id_ost,tr_type) values(?,?,?,?)',[10,i,ost[i],'Т'], function(err, result) {
    if (err) console.log(err);
    //console.log(result);
  });
}

/*var query = conn.query('DELETE FROM rout WHERE id_tr=10 AND tr_type=?','Т', function(err, result) {
    if (err) console.log(err);
    console.log(result);
  });*/
  //console.log(query.sql);
  //console.log(id_rt,' ',visit,' ',id_ost);
  conn.end();
  return true;
});



router.use('/proverka', function(req, res) {
    //конект с БД
    console.log('Get connection ...');
    var conn = mysql.createConnection({
      database: 'station',
      host: "127.0.0.1",
      user: "root",
      password: "alexis"
    });
    conn.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
    var ost_id=[0];

    var query = conn.query('SELECT*FROM rout,station WHERE rout.id_tr=1 AND rout.tr_type=? AND rout.id_ost=station.stid','Т', function(err, result) {
      if (err) console.log(err);
      json = JSON.stringify(result);
      res.send(json);
    });

  conn.end();
  return true;
});
//для заполнения БД с прогновазами на время прибытия
router.use('/prognoz', function(req, res) {
    //конект с БД
    console.log('Get connection ...');
    var conn = mysql.createConnection({
      database: 'station',
      host: "127.0.0.1",
      user: "root",
      password: "alexis"
    });
    conn.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
    var ost=[86,102,81,83,85,47];
    var time=[ 12, 4, 2, 2, 2];
    //console.log(ost.length-time.length-1);
    //console.log(ost.length+' '+time.length);
    //console.log(ost.length+' '+time.length);
   for(var i=1; i<ost.length-1;i++){
     time[i]=time[i]+time[i-1];
   var query = conn.query('INSERT INTO prognoz(first_st,second_st,id_marsh,time) values(?,?,?,?)',[ost[i],ost[i-1],6,time[i]], function(err, result) {
        if (err) console.log(err);
        //console.log(result);
      });
    }
    /*var query = conn.query('DELETE FROM prognoz WHERE id_marsh=0 ', function(err, result) {
      if (err) console.log(err);
      console.log(result);
    });*/
    conn.end();
    return true;
});

//не доделанный поиск маршрута по номеру
router.use('/poisk', function(req, res) {
    //конект с БД
    console.log('Get connection ...');
    var conn = mysql.createConnection({
      database: 'station',
      host: "127.0.0.1",
      user: "root",
      password: "alexis"
    });
    conn.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
    var text = document.getElementById("result").innerHTML;
    console.log(text);
    /*var query = conn.query('SELECT*FROM rout', function(err, result) {
      if (err) console.log(err);
      json = JSON.stringify(result);
      //console.log(json);
      res.send(json);
    });*/

  conn.end();
  return true;
});
//запись в бд id маршрутов
router.use('/print_mysql_marsh', function(req, res) {
    //конект с БД
    console.log('Get connection ...');
    var conn = mysql.createConnection({
      database: 'station',
      host: "127.0.0.1",
      user: "root",
      password: "alexis"
    });
    conn.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
var namber=[3,1,4,3,6,5,1,4,7,8,10];
var type=['Т','Тр','Тр','Тр','Тр','Тр','Т','Т','Т','Т','Т'];
for(var i=0; i<namber.length;i++){
//console.log(ost[i]);
var query = conn.query('INSERT INTO id_marsh(id_marsh,type,namber) values(?,?,?)',[i,type[i],namber[i]], function(err, result) {
    if (err) console.log(err);
    //console.log(result);
  });
}
  conn.end();
  return true;
});

//стандартнй метод получения данных get запроса
router.use('/answer', function(req, res) {
  const url = 'https://weather.rambler.ru/api/v3/today/?all_data=0&url_path=v-moskve';
  var answer = '';
  request({
     method: 'GET',
     url: url,
     qs: {
       all_data:0,
       url_path:'v-moskve'
    }
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
       res.send(body);
    }
  })
});




//стандарный метод в нашем случаее не работает
router.use('/answer1', function(req, res) {
  const url = 'http://www.irkbus.ru/php/getVehiclesMarkers.php?rids=67-0,66-0,2-1,1-1,19-0,20-0,4-1,3-1,343-0,344-0,282-0,283-0,6-0,5-0,5-1,232-0,233-0,347-0,348-0,8-1,9-1,83-0,84-0,201-0,202-0,11-1,10-1,1-0,2-0,128-0,129-0,7-1,6-1,215-0,214-0,18-0,17-0,12-1,12-0,11-0,4-0,3-0,23-0,24-0,306-0,307-0,9-0,10-0,57-0,56-0,63-0,62-0,61-0,60-0,309-0,308-0,13-0,14-0,243-0,242-0,15-0,16-0,297-0,296-0,25-0,26-0,310-0,311-0,64-0,65-0,346-0,68-0,69-0,27-0,28-0,71-0,70-0,73-0,72-0,53-0,52-0,279-0,278-0,332-0,36-0,37-0,234-0,235-0,35-0,34-0,228-0,229-0,127-0,126-0,299-0,298-0,300-0,301-0,78-0,77-0,124-0,125-0,82-0,81-0,80-0,79-0,303-0,302-0,31-0,30-0,222-0,223-0,206-0,207-0,225-0,224-0,209-0,208-0,240-0,241-0,287-0,286-0,226-0,227-0,211-0,210-0,216-0,217-0,219-0,218-0,337-0,338-0,42-0,43-0,336-0,335-0,237-0,236-0,220-0,221-0,327-0,326-0,49-0,48-0,312-0,313-0,314-0,293-0,292-0,305-0,304-0,345-0,46-0,47-0,290-0,291-0,32-0,33-0,212-0,213-0,316-0,315-0,342-0,295-0,341-0,203-0,21-0,22-0,38-0,230-0,231-0,339-0,340-0,324-0,323-0,320-0,319-0,281-0,280-0,322-0,123-0,329-0,328-0,238-0,239-0,321-0,349-0,334-0,333-0&lat0=0&lng0=0&lat1=90&lng1=180&curk=21407291&city=irkutsk&info=12345&_=1548651097070';
  var answer = '';
  request({
     method: 'GET',
     host:   'http://www.irkbus.ru',
     url: url,
     qs: {
       rids: '67-0,66-0,2-1,1-1,19-0,20-0,4-1,3-1,343-0,344-0,282-0,283-0,6-0,5-0,5-1,232-0,233-0,347-0,348-0,8-1,9-1,83-0,84-0,201-0,202-0,11-1,10-1,1-0,2-0,128-0,129-0,7-1,6-1,215-0,214-0,18-0,17-0,12-1,12-0,11-0,4-0,3-0,23-0,24-0,306-0,307-0,9-0,10-0,57-0,56-0,63-0,62-0,61-0,60-0,309-0,308-0,13-0,14-0,243-0,242-0,15-0,16-0,297-0,296-0,25-0,26-0,310-0,311-0,64-0,65-0,346-0,68-0,69-0,27-0,28-0,71-0,70-0,73-0,72-0,53-0,52-0,279-0,278-0,332-0,36-0,37-0,234-0,235-0,35-0,34-0,228-0,229-0,127-0,126-0,299-0,298-0,300-0,301-0,78-0,77-0,124-0,125-0,82-0,81-0,80-0,79-0,303-0,302-0,31-0,30-0,222-0,223-0,206-0,207-0,225-0,224-0,209-0,208-0,240-0,241-0,287-0,286-0,226-0,227-0,211-0,210-0,216-0,217-0,219-0,218-0,337-0,338-0,42-0,43-0,336-0,335-0,237-0,236-0,220-0,221-0,327-0,326-0,49-0,48-0,312-0,313-0,314-0,293-0,292-0,305-0,304-0,345-0,46-0,47-0,290-0,291-0,32-0,33-0,212-0,213-0,316-0,315-0,342-0,295-0,341-0,203-0,21-0,22-0,38-0,230-0,231-0,339-0,340-0,324-0,323-0,320-0,319-0,281-0,280-0,322-0,123-0,329-0,328-0,238-0,239-0,321-0,349-0,334-0,333-0',
       lat0: 0,
       lng0: 0,
       lat1: 90,
       lng1: 180,
       curk: 21407291,
       city: "irkutsk",
       info: 12345,
       _:1548651097070
    }
  }, function (error, response, body) {
       console.log(body);
       console.log(error);
       res.send(body);
    })
  });


module.exports = router;
